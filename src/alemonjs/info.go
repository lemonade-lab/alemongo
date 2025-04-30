package alemonjs

import (
	"os"
	"strconv"

	"github.com/shirou/gopsutil/v3/process"
)

// 获取机器人信息
func Info(name string) (BotInfoResponse, error) {
	// 机器人目录
	botPath := GetBotPath(name)
	// 是否安装依赖
	nodeModules := ExistsNodeModules(name)
	// 读取文件夹创建时间
	fileInfo, err := os.Stat(botPath)
	if err != nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "获取信息失败",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    "",
			},
		}, nil
	}
	// 获取创建时间
	createAt := fileInfo.ModTime().Format("2006-01-02 15:04:05")
	// 获取 pid 文件
	pidFilePath := GetPidFilePath(name)
	pidData, err := os.ReadFile(pidFilePath)
	if err != nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "未找到pid文件",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	pid, err := strconv.Atoi(string(pidData))
	if err != nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "pid文件格式错误",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, err
	}
	// 使用 gopsutil 检查进程是否存在
	proc, err := process.NewProcess(int32(pid))
	if err != nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "未找到进程",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	running, err := proc.IsRunning()
	if err != nil {
		return BotInfoResponse{
			Code: 0,
			Msg:  "获取进程状态失败",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	if !running {
		return BotInfoResponse{
			Code: 0,
			Msg:  "进程不存在",
			Data: BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	return BotInfoResponse{
		Code: 1,
		Msg:  "获取进程信息成功",
		Data: BotInfo{
			Name:        name,
			Status:      1,
			Pid:         int(proc.Pid),
			NodeModules: nodeModules,
			CreateAt:    createAt,
		},
	}, nil
}
