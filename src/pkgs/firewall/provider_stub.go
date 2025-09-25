//go:build !darwin && !linux && !windows

package firewall

import "runtime"

type unsupportedProvider struct {
	backend string
	reason  string
}

func newProvider() Provider {
	// 根据平台给出拟使用后端，用于前端展示
	backend := "unknown"
	switch runtime.GOOS {
	case "linux":
		backend = "nftables"
	case "windows":
		backend = "netsh"
	}
	return &unsupportedProvider{backend: backend, reason: "platform_unsupported"}
}

func (u *unsupportedProvider) Backend() string { return u.backend }
func (u *unsupportedProvider) Supported() bool { return false }

func (u *unsupportedProvider) Status() (*Status, error) {
	return &Status{
		OS:                runtime.GOOS,
		Backend:           u.backend,
		Supported:         false,
		UnsupportedReason: u.reason,
		Error:             "当前平台暂未实现防火墙适配",
		NextActions:       []string{"等待后续版本支持", "可手动使用系统原生命令"},
	}, nil
}

func (u *unsupportedProvider) Plan(req PlanRequest) (*Plan, error) {
	return &Plan{
		OS:                runtime.GOOS,
		Backend:           u.backend,
		Supported:         false,
		UnsupportedReason: u.reason,
		Message:           "当前平台暂未实现防火墙适配",
		NextActions:       []string{"等待后续版本支持", "可手动使用系统原生命令"},
	}, nil
}
