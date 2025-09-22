package models

// GitHubUserInfo GitHub 用户信息
type GitHubUserInfo struct {
	ID       int64  `json:"id"`
	Login    string `json:"login"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar_url"`
	Location string `json:"location"`
	Bio      string `json:"bio"`
}

// GitHubAccessToken GitHub 访问令牌响应
type GitHubAccessToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

// GitHubOAuthRequest GitHub OAuth 请求
type GitHubOAuthRequest struct {
	Code  string `form:"code" json:"code" binding:"required"`
	State string `form:"state" json:"state"`
}

// GitHubBindRequest GitHub 绑定请求
type GitHubBindRequest struct {
	Code string `form:"code" json:"code" binding:"required"`
}

// GitHubConfig GitHub OAuth 配置
type GitHubConfig struct {
	ClientID     string `form:"client_id" json:"client_id"`         // GitHub OAuth Client ID
	ClientSecret string `form:"client_secret" json:"client_secret"` // GitHub OAuth Client Secret
	RedirectURL  string `form:"redirect_url" json:"redirect_url"`   // 回调URL
}
