package response

type ResCode int64

const (
	CodeSuccess ResCode = 1000 + iota
	CodeServerBusy
	CodeInvalidParam
	RobotCreateFailed
	RobotNameIsEmpty
	RobotNameInvalid
	RobotNameTooLong
	RobotNotExist
	RobotAlreadyExist
	RobotConfigNotExist
	ReadRobotConfigFailed
	ErrorRobotLog
	CreateConfigFailed
	ConfigNameIsEmpty
	ConfigContentIsEmpty
	ReadConfigFailed
	ConfigFileIsDeleted
	DeleteConfigFileFailed
	ErrorLogLevel
	ErrCreateConfigCatFailed
	ErrReadConfigCatFailed

	SessionInvalid
)

var codeMsgMap = map[ResCode]string{
	CodeSuccess:              "success",
	CodeServerBusy:           "服务繁忙",
	CodeInvalidParam:         "请求参数错误",
	RobotCreateFailed:        "创建机器人失败",
	RobotNameIsEmpty:         "机器人名不能为空",
	RobotNameInvalid:         "机器人名不合法",
	RobotNameTooLong:         "机器人名过长",
	RobotNotExist:            "机器人不存在",
	RobotAlreadyExist:        "机器人已存在",
	RobotConfigNotExist:      "机器人配置不存在",
	ReadRobotConfigFailed:    "读取机器人配置失败",
	ErrorRobotLog:            "机器人日志初始化错误",
	CreateConfigFailed:       "配置失败",
	ConfigNameIsEmpty:        "配置名不能为空",
	ConfigContentIsEmpty:     "配置内容不能为空",
	ReadConfigFailed:         "读取配置失败",
	ConfigFileIsDeleted:      "配置文件已被删除",
	DeleteConfigFileFailed:   "删除配置文件失败",
	ErrorLogLevel:            "日志级别错误",
	ErrCreateConfigCatFailed: "创建配置目录失败",
	ErrReadConfigCatFailed:   "读取配置目录失败",

	SessionInvalid: "无效会话",
}

func (c ResCode) Msg() string {
	msg, ok := codeMsgMap[c]
	if !ok {
		msg = codeMsgMap[CodeServerBusy]
	}
	return msg
}
