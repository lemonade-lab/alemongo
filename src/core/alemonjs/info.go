package alemonjs

import (
	"alemongo/src/core/process"
	"os"
)

func Info(name string) (BotInfoResponse, error) {
	botPath := GetBotPath(name)
	nodeModules := ExistsNodeModules(name)

	// 获取文件夹创建时间
	fileInfo, err := os.Stat(botPath)
	createAt := ""
	if err == nil {
		createAt = fileInfo.ModTime().Format("2006-01-02 15:04:05")
	}

	pm := process.GetProcessManager()
	proc := pm.GetProcess(name)
	if proc == nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "进程未注册",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}

	status, pid := proc.Info()
	if status == "running" && pid > 0 {
		return BotInfoResponse{
			Code: 1,
			Msg:  "获取进程信息成功",
			Data: BotInfo{
				Name:        name,
				Status:      1,
				Pid:         pid,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	return BotInfoResponse{
		Code: 0,
		Msg:  "进程未运行",
		Data: BotInfo{
			Name:        name,
			Status:      0,
			Pid:         0,
			NodeModules: nodeModules,
			CreateAt:    createAt,
		},
	}, nil
}
