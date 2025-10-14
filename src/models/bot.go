package models

type BotInfo struct {
	Name        string `json:"name"`         // 机器人名
	Status      int    `json:"status"`       // 0: 未运行, 1: 运行中
	Pid         int    `json:"pid"`          // 进程ID
	NodeModules bool   `json:"node_modules"` // 是否安装依赖
	CreateAt    string `json:"create_at"`    // 创建时间
	Port        int    `json:"port"`         // 端口号
}

type BotInfoResponse struct {
	Code int     `json:"code"`
	Msg  string  `json:"msg"`
	Data BotInfo `json:"data"`
}

type BotPackagesGitBranchCommitsInfo struct {
	Hash    string `json:"hash"`
	Message string `json:"message"`
	Author  string `json:"author"`
	Date    string `json:"date"`
}

type BotPackagesGitCommits struct {
	Commits   []BotPackagesGitBranchCommitsInfo `json:"commits"`
	Total     int                               `json:"total"`
	Page      int                               `json:"page"`
	PageSize  int                               `json:"page_size"`
	TotalPage int                               `json:"total_page"`
}

type BotPackagesGitBranches struct {
	Branches  []string `json:"branches"`
	Total     int      `json:"total"`
	Page      int      `json:"page"`
	PageSize  int      `json:"page_size"`
	TotalPage int      `json:"total_page"`
}

type BotPackagesGitStatus struct {
	CurrentBranch string              `json:"current_branch"`
	IsClean       bool                `json:"is_clean"`
	ModifiedFiles int                 `json:"modified_files"`
	Files         []map[string]string `json:"files"`
}
