package logic

import (
	"alemongo/src/models"
	"alemongo/src/utils"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type pkgManager string

const (
	pmApt     pkgManager = "apt"
	pmYum     pkgManager = "yum"
	pmDnf     pkgManager = "dnf"
	pmApk     pkgManager = "apk"
	pmBrew    pkgManager = "brew"
	pmUnknown pkgManager = "unknown"
)

func detectPkgManager() pkgManager {
	if runtime.GOOS == "darwin" {
		if _, err := exec.LookPath("brew"); err == nil {
			return pmBrew
		}
		return pmUnknown
	}
	// Linux
	if _, err := exec.LookPath("apt-get"); err == nil {
		return pmApt
	}
	if _, err := exec.LookPath("dnf"); err == nil {
		return pmDnf
	}
	if _, err := exec.LookPath("yum"); err == nil {
		return pmYum
	}
	if _, err := exec.LookPath("apk"); err == nil {
		return pmApk
	}
	return pmUnknown
}

func runWithTimeout(cmdStr string) (string, error) {
	// run via bash -lc to resolve shell functions like nvm
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	cmd := utils.CommandContext(ctx, "bash", "-lc", cmdStr)
	out, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return "", fmt.Errorf("命令超时: %s", cmdStr)
	}
	if err != nil {
		return string(out), err
	}
	return string(out), nil
}

func trimNL(s string) string { return strings.TrimSpace(strings.ReplaceAll(s, "\x00", "")) }

func which(bin string) (string, error) {
	p, err := exec.LookPath(bin)
	if err != nil {
		return "", err
	}
	return p, nil
}

// detectNvm tries multiple ways as nvm is a shell function
func detectNvm() (installed bool, version string, path string, notes []string) {
	// 1) bash -lc 'command -v nvm'
	if out, err := runWithTimeout("command -v nvm"); err == nil && strings.TrimSpace(out) != "" {
		// get version
		if vout, verr := runWithTimeout("nvm --version"); verr == nil {
			return true, trimNL(vout), trimNL(out), notes
		}
		return true, "", trimNL(out), append(notes, "检测到 nvm，但获取版本失败")
	}
	// 2) check default NVM_DIR
	home, _ := os.UserHomeDir()
	nvmDir := filepath.Join(home, ".nvm")
	nvmSh := filepath.Join(nvmDir, "nvm.sh")
	if st, err := os.Stat(nvmSh); err == nil && !st.IsDir() {
		// try sourcing
		if vout, verr := runWithTimeout(fmt.Sprintf("export NVM_DIR=\"%s\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"; nvm --version", nvmDir)); verr == nil {
			return true, trimNL(vout), nvmSh, notes
		}
		return true, "", nvmSh, append(notes, "存在 nvm.sh，但获取版本失败")
	}
	return false, "", "", notes
}

func detectChrome() (installed bool, version, path string, notes []string) {
	// try common binaries
	candidates := []string{"google-chrome", "google-chrome-stable", "chromium", "chromium-browser"}
	for _, c := range candidates {
		if p, err := which(c); err == nil {
			// '--version' works for both
			if out, err2 := runWithTimeout(fmt.Sprintf("%s --version", c)); err2 == nil {
				return true, trimNL(out), p, notes
			}
			return true, "", p, append(notes, "检测到 Chrome/Chromium，但获取版本失败")
		}
	}
	return false, "", "", notes
}

func detectGit() (installed bool, version, path string, notes []string) {
	if p, err := which("git"); err == nil {
		if out, err2 := runWithTimeout("git --version"); err2 == nil {
			return true, trimNL(out), p, notes
		}
		return true, "", p, append(notes, "检测到 git，但获取版本失败")
	}
	return false, "", "", notes
}

func detectNode() (installed bool, version, path string, notes []string) {
	if p, err := which("node"); err == nil {
		if out, err2 := runWithTimeout("node -v"); err2 == nil {
			return true, trimNL(out), p, notes
		}
		return true, "", p, append(notes, "检测到 node，但获取版本失败")
	}
	return false, "", "", notes
}

// Generate install commands for a dependency by manager
func commandsFor(dep models.DependencyName, m pkgManager, opts models.DepInstallRequest) []string {
	name := string(dep)
	switch dep {
	case models.DepChrome:
		switch m {
		case pmApt:
			// Prefer chromium to avoid adding Google repo by default
			return []string{
				"apt-get update",
				"apt-get install -y chromium",
			}
		case pmDnf, pmYum:
			return []string{"dnf install -y chromium"}
		case pmApk:
			return []string{"apk add --no-cache chromium"}
		case pmBrew:
			// On macOS prefer cask; provide note in UI
			return []string{"brew install --cask google-chrome"}
		default:
			return []string{"echo '未知包管理器，请手动安装 Chrome/Chromium'"}
		}
	case models.DepGit:
		switch m {
		case pmApt:
			return []string{"apt-get update", "apt-get install -y git"}
		case pmDnf:
			return []string{"dnf install -y git"}
		case pmYum:
			return []string{"yum install -y git"}
		case pmApk:
			return []string{"apk add --no-cache git"}
		case pmBrew:
			return []string{"brew install git"}
		default:
			return []string{"echo '未知包管理器，请手动安装 git'"}
		}
	case models.DepNvm:
		ver := opts.NvmVersion
		if ver == "" {
			ver = "v0.40.3"
		}
		// nvm via official script（与 PROFILE 设置放在同一条命令内，避免分进程丢失环境）
		return []string{
			fmt.Sprintf("export PROFILE=\"$HOME/.bashrc\"; if [ -n \"$ZSH_VERSION\" ]; then PROFILE=\"$HOME/.zshrc\"; fi; curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/%s/install.sh | bash", ver),
			// 验证（自带 source 前缀，因任务逐条执行）
			"export NVM_DIR=\"$HOME/.nvm\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"; command -v nvm && nvm --version",
		}
	case models.DepNode:
		if opts.UseNvm {
			want := opts.NodeVersion
			if want == "" {
				want = "22"
			}
			// 每条命令自带 source 前缀，避免逐条执行时 nvm 未定义
			prefix := "export NVM_DIR=\"$HOME/.nvm\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\";"
			return []string{
				prefix + " " + fmt.Sprintf("nvm install %s", want),
				prefix + " " + fmt.Sprintf("nvm use %s", want),
				prefix + " " + fmt.Sprintf("nvm alias default %s", want),
				prefix + " node -v && npm -v",
			}
		}
		// package-manager path
		switch m {
		case pmApt:
			return []string{"apt-get update", "apt-get install -y nodejs npm"}
		case pmDnf:
			return []string{"dnf install -y nodejs npm"}
		case pmYum:
			return []string{"yum install -y nodejs npm"}
		case pmApk:
			return []string{"apk add --no-cache nodejs npm"}
		case pmBrew:
			return []string{"brew install node"}
		default:
			return []string{"echo '未知包管理器，请手动安装 node'"}
		}
	default:
		return []string{fmt.Sprintf("echo '未知依赖: %s'", name)}
	}
}

// CheckDependencies 检测并给出安装建议（不执行）
func CheckDependencies(names []string) models.DepCheckResponse {
	m := detectPkgManager()
	osName := runtime.GOOS
	res := models.DepCheckResponse{OS: osName, Manager: string(m)}
	add := func(st models.DepStatus) { res.Items = append(res.Items, st) }

	want := names
	if len(want) == 0 {
		want = []string{string(models.DepChrome), string(models.DepGit), string(models.DepNvm), string(models.DepNode)}
	}

	for _, n := range want {
		var st models.DepStatus
		st.Name = n
		st.OS = osName
		st.Manager = string(m)
		switch models.DependencyName(n) {
		case models.DepChrome:
			ok, ver, p, notes := detectChrome()
			st.Installed, st.Version, st.Path, st.Notes = ok, ver, p, notes
			if !ok {
				st.InstallCommands = commandsFor(models.DepChrome, m, models.DepInstallRequest{})
			}
		case models.DepGit:
			ok, ver, p, notes := detectGit()
			st.Installed, st.Version, st.Path, st.Notes = ok, ver, p, notes
			if !ok {
				st.InstallCommands = commandsFor(models.DepGit, m, models.DepInstallRequest{})
			}
		case models.DepNvm:
			ok, ver, p, notes := detectNvm()
			st.Installed, st.Version, st.Path, st.Notes = ok, ver, p, notes
			if !ok {
				st.InstallCommands = commandsFor(models.DepNvm, m, models.DepInstallRequest{})
			}
		case models.DepNode:
			ok, ver, p, notes := detectNode()
			st.Installed, st.Version, st.Path, st.Notes = ok, ver, p, notes
			if !ok {
				st.InstallCommands = commandsFor(models.DepNode, m, models.DepInstallRequest{UseNvm: true})
			}
		default:
			st.Errors = append(st.Errors, "不支持的依赖名称")
		}
		add(st)
	}
	return res
}

// PlanInstall 生成安装脚本（不执行）
func PlanInstall(req models.DepInstallRequest) models.DepInstallResponse {
	m := detectPkgManager()
	osName := runtime.GOOS
	if len(req.Names) == 0 {
		req.Names = []string{string(models.DepChrome), string(models.DepGit), string(models.DepNvm), string(models.DepNode)}
	}
	plan := make(map[string][]string)
	for _, n := range req.Names {
		dep := models.DependencyName(n)
		plan[n] = commandsFor(dep, m, req)
	}
	return models.DepInstallResponse{
		OS:              osName,
		Manager:         string(m),
		PlannedCommands: plan,
		Executed:        false,
		Message:         "仅生成安装脚本，未执行",
	}
}
