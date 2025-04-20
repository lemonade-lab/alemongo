package alemonjs

// 重启机器人
func Restart(name string) (string, error) {
	stopMessage, err := Stop(name)
	if err != nil && stopMessage != "" {
		return stopMessage, err
	}
	runMessage, err := Run(name)
	if err != nil && runMessage != "" {
		return runMessage, err
	}
	return "", nil
}
