package response

type ResCode int64

const (
	CodeSuccess ResCode = 1000 + iota
	CodeServerBusy
	RobotNameIsEmpty
	RobotNotExist
	RobotConfigNotExist
	ReadRobotConfigFailed
	ConfigNameIsEmpty
	ReadConfigFailed
	ConfigFileIsDeleted
	DeleteConfigFileFailed
	ErrorLogLevel
	ErrorRobotLog
)

var codeMsgMap = map[ResCode]string{
	CodeSuccess:            "success",
	CodeServerBusy:         "服务繁忙",
	RobotNameIsEmpty:       "机器人名不能为空",
	RobotNotExist:          "机器人不存在",
	RobotConfigNotExist:    "机器人配置不存在",
	ReadRobotConfigFailed:  "读取机器人配置失败",
	ConfigNameIsEmpty:      "配置名不能为空",
	ReadConfigFailed:       "读取配置失败",
	ConfigFileIsDeleted:    "配置文件已被删除",
	DeleteConfigFileFailed: "删除配置文件失败",
	ErrorLogLevel:          "日志级别错误",
	ErrorRobotLog:          "机器人日志初始化错误",
}

func (c ResCode) Msg() string {
	msg, ok := codeMsgMap[c]
	if !ok {
		msg = codeMsgMap[CodeServerBusy]
	}
	return msg
}
