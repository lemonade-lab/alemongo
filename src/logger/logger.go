package logger

import (
	"alemongo/src/paths"
	"alemongo/src/settings"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	logTmFmtWithMS = "2006-01-02 15:04:05.000"
)

var (
	lg             *zap.Logger
	mainRotateLogs *rotatelogs.RotateLogs
	botLogger      sync.Map // map[string]*RobotLogger
)

func CloseLogFiles() error {
	if mainRotateLogs != nil {
		if err := mainRotateLogs.Close(); err != nil {
			return err
		}
	} else {
		return errors.New("main rotate logs is nil")
	}
	return nil
}

type RobotLoggerWithRotate struct {
	Logger     *zap.Logger
	RotateLogs *rotatelogs.RotateLogs
}

func (r *RobotLoggerWithRotate) Close() error {
	err := r.RotateLogs.Close()
	if err != nil {
		return errors.New("关闭日志文件失败!")
	}
	return nil
}

type zapProgressWriter struct {
	lg *zap.Logger
}

func (w *zapProgressWriter) Write(p []byte) (int, error) {
	msg := strings.TrimRight(string(p), "\r\n")
	w.lg.Info(msg)
	return len(p), nil
}

type RobotLoggerWriter struct {
	RobotLogger *RobotLoggerWithRotate
	outMu       sync.Mutex
}

func (w *RobotLoggerWriter) Writer() io.Writer {
	w.outMu.Lock()
	defer w.outMu.Unlock()
	return &zapProgressWriter{lg: w.RobotLogger.Logger}
}

func NewRobotLoggerWriter(z *RobotLoggerWithRotate) *RobotLoggerWriter {
	return &RobotLoggerWriter{
		RobotLogger: &RobotLoggerWithRotate{
			Logger:     z.Logger,
			RotateLogs: z.RotateLogs,
		},
	}
}

// GetOrCreateBotLogger 拿到缓存中的botLogger， 如果没有则说明是新的机器人，则维护一个新的存入到缓存中
func GetOrCreateBotLogger(botName string, level zapcore.Level) (*RobotLoggerWithRotate, error) {
	if blg, ok := botLogger.Load(botName); ok {
		return &RobotLoggerWithRotate{
			Logger:     blg.(*RobotLoggerWithRotate).Logger,
			RotateLogs: blg.(*RobotLoggerWithRotate).RotateLogs}, nil
	}
	rlr, err := NewRobotLogger(botName, level)
	if err != nil {
		return nil, err
	}
	botLogger.Store(botName, rlr)
	return rlr, nil
}

func DeleteBotLogger(botName string, level zapcore.Level) {
	if _, ok := botLogger.Load(botName); ok {
		botLogger.Delete(botName)
	}
}

func Init(cfg *settings.LogConfig, mode string) (err error) {
	writeSyncer, rotate := getLogWriter(cfg.Filename)
	mainRotateLogs = rotate
	encoder := getEncoder()
	var l = new(zapcore.Level)
	err = l.UnmarshalText([]byte(cfg.Level))
	if err != nil {
		return
	}
	var core zapcore.Core
	if mode == "dev" {
		consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
		core = zapcore.NewTee(
			zapcore.NewCore(encoder, writeSyncer, l),
			zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), zapcore.DebugLevel),
		)
	} else {
		core = zapcore.NewCore(encoder, writeSyncer, l)
	}

	lg = zap.New(core, zap.AddCaller())
	zap.ReplaceGlobals(lg)
	zap.L().Info("logger init success")
	return
}

// NewRobotLogger 为每个机器人单独建立一个日志管理
func NewRobotLogger(botName string, level zapcore.Level) (*RobotLoggerWithRotate, error) {
	robotLogPath := paths.GetBotLogsPath(botName)
	if _, err := os.Stat(robotLogPath); os.IsNotExist(err) {
		if err := os.Mkdir(robotLogPath, os.ModePerm); err != nil {
			// 创建目录失败
		}
	}
	robotWS, rotate := getLogWriter(robotLogPath)
	robotEncoder := getEncoder()
	robotCore := zapcore.NewCore(robotEncoder, robotWS, level)

	botLogger := zap.L().WithOptions(zap.WrapCore(func(existing zapcore.Core) zapcore.Core {
		return zapcore.NewTee(existing, robotCore)
	}))

	return &RobotLoggerWithRotate{
		Logger:     botLogger,
		RotateLogs: rotate,
	}, nil
}

func getEncoder() zapcore.Encoder {
	customTimeEncoder := func(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString("[" + t.Format(logTmFmtWithMS) + "]")
	}
	customLevelEncoder := func(level zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString("[" + level.CapitalString() + "]")
	}
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:  "ts",
		LevelKey: "level_name",
		NameKey:  "logger",
		//CallerKey:      "caller_line",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    customLevelEncoder,
		EncodeTime:     customTimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
		EncodeName:     zapcore.FullNameEncoder,
	}
	return zapcore.NewConsoleEncoder(encoderConfig)
}

func getLogWriter(filename string) (zapcore.WriteSyncer, *rotatelogs.RotateLogs) {
	// 容量大小分割
	//lumberJackLogger := &lumberjack.Logger{
	//	Filename:   filename,
	//	MaxSize:    maxSize,
	//	MaxBackups: maxBackup,
	//	MaxAge:     maxAge,
	//}
	// 按照时间分割
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		_ = os.Mkdir(filename, os.ModePerm)
	}

	rotateLogger, _ := rotatelogs.New(
		filename+"/%Y-%m-%d"+".log",
		rotatelogs.WithMaxAge(30*24*time.Hour),
		rotatelogs.WithRotationTime(time.Hour*24),
	)
	return zapcore.AddSync(rotateLogger), rotateLogger
}

// GinLogger 接收gin框架默认的日志
func GinLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		c.Next()

		cost := time.Since(start)
		lg.Info(path,
			zap.Int("status", c.Writer.Status()),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("query", query),
			zap.String("ip", c.ClientIP()),
			zap.String("user-agent", c.Request.UserAgent()),
			zap.String("errors", c.Errors.ByType(gin.ErrorTypePrivate).String()),
			zap.Duration("cost", cost),
		)
	}
}

// GinRecovery recover掉项目可能出现的panic，并使用zap记录相关日志
func GinRecovery(stack bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Check for a broken connection, as it is not really a
				// condition that warrants a panic stack trace.
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") || strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(c.Request, false)
				if brokenPipe {
					lg.Error(c.Request.URL.Path,
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
					)
					// If the connection is dead, we can't write a status to it.
					c.Error(err.(error)) // nolint: errcheck
					c.Abort()
					return
				}

				if stack {
					lg.Error("[Recovery from panic]",
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
						zap.String("stack", string(debug.Stack())),
					)
				} else {
					lg.Error("[Recovery from panic]",
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
					)
				}
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		c.Next()
	}
}
