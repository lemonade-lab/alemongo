package program

import (
	"flag"
	"fmt"
	"os"
	"os/exec"

	"github.com/xyproto/go-autostart"
)

// 注册指令。
func RegisterInstruction() {
	// 定义命令行参数
	background := flag.Bool("b", false, "以后台模式运行")
	flag.Parse()

	// 创建一个自动启动的应用程序
	app := &autostart.App{
		Name:        "alemongo",           // 程序名称
		DisplayName: "AleMongo",           // 显示名称
		Exec:        []string{os.Args[0]}, // 可执行文件路径
	}

	// 检查是否已经注册
	if !app.IsEnabled() {
		err := app.Enable()
		if err != nil {
			fmt.Println("无法注册程序:", err)
			os.Exit(1)
		}
		fmt.Println("程序已注册为开机启动项")
	} else {
		fmt.Println("程序已注册，无需重复注册")
	}

	// 如果指定了后台运行参数
	if *background {
		cmd := exec.Command(os.Args[0], flag.Args()...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = nil
		err := cmd.Start()
		if err != nil {
			fmt.Println("无法以后台模式启动:", err)
			os.Exit(1)
		}
		fmt.Println("程序已以后台模式运行，PID:", cmd.Process.Pid)
		os.Exit(0)
	} else {
		fmt.Println("程序以前台模式运行")
	}
}

// 注销指令。
func UnRegisterInstruction() {
	// 创建一个自动启动的应用程序
	app := &autostart.App{
		Name:        "alemongo",           // 程序名称
		DisplayName: "AleMongo",           // 显示名称
		Exec:        []string{os.Args[0]}, // 可执行文件路径
	}

	// 检查是否已经注册
	if app.IsEnabled() {
		err := app.Disable()
		if err != nil {
			fmt.Println("无法注销程序:", err)
			os.Exit(1)
		}
		fmt.Println("程序已成功注销")
	} else {
		fmt.Println("程序未注册，无需注销")
	}
}
