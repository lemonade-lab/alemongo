package alemonjs

import (
	"alemongo/src/core/process"
	"os"
	"os/exec"
	"path"
)

// 运行机器人
func Run(name string) (string, error) {
	// 检查系统是否安装了 Node.js
	nodePath, err := exec.LookPath("node")
	if err != nil {
		return "未找到NodeJS", err
	}
	pm := process.GetProcessManager()
	if pm.IsRunning(name) {
		return "机器人已经在运行", nil
	}
	if !ExistsNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}
	// 机器人目录
	botPath := GetBotPath(name)
	var indexPath string
	tryFiles := []string{
		path.Join("alemonjs", "index.js"),
		"index.js",
		path.Join("src", "index.js"),
		path.Join("lib", "index.js"),
	}
	found := false
	for _, fp := range tryFiles {
		if _, err := os.Stat(path.Join(botPath, fp)); err == nil {
			indexPath = fp
			found = true
			break
		}
	}
	if !found {
		return "启动脚本不存在,请新建index.js", os.ErrNotExist
	}
	// 日志和 PID 文件路径
	logPath := GetBotLogPath(name)
	pidFile := GetPidFilePath(name)
	// 交给进程管理器托管
	pm.AddProcess(process.NodeProcessConfig{
		Name:     name,
		Dir:      botPath,
		Node:     nodePath,
		ScriptJS: indexPath,
		LogPath:  logPath,
		PidFile:  pidFile,
	})
	// 启动
	proc := pm.GetProcess(name)
	if proc == nil {
		return "进程未注册", os.ErrNotExist
	}
	err = proc.Start()
	if err != nil {
		return "启动失败", err
	}
	return "", nil
}
