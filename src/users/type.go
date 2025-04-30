package users

type User struct {
	Identity   string `json:"identity"`
	UserName   string `json:"username"`
	PassWord   string `json:"password"`
	MasterName string `json:"mastername"`
}
