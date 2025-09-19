package github

import (
	"alemongo/src/models"
	"alemongo/src/settings"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	GitHubAuthURL     = "https://github.com/login/oauth/authorize"
	GitHubTokenURL    = "https://github.com/login/oauth/access_token"
	GitHubUserInfoURL = "https://api.github.com/user"
)

// GetAuthURL 获取 GitHub 授权 URL
func GetAuthURL(state string) string {
	params := url.Values{}
	params.Add("client_id", settings.Conf.GitHub.ClientID)
	params.Add("redirect_uri", settings.Conf.GitHub.RedirectURL)
	params.Add("scope", "user:email")
	params.Add("state", state)

	return fmt.Sprintf("%s?%s", GitHubAuthURL, params.Encode())
}

// ExchangeCodeForToken 用授权码换取访问令牌
func ExchangeCodeForToken(code string) (*models.GitHubAccessToken, error) {
	// 检查配置是否完整
	if settings.Conf.GitHub.ClientID == "" || settings.Conf.GitHub.ClientSecret == "" {
		return nil, fmt.Errorf("GitHub OAuth 配置不完整，请检查 client_id 和 client_secret")
	}

	data := url.Values{}
	data.Set("client_id", settings.Conf.GitHub.ClientID)
	data.Set("client_secret", settings.Conf.GitHub.ClientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", settings.Conf.GitHub.RedirectURL)

	req, err := http.NewRequest("POST", GitHubTokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// 设置超时时间
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求 GitHub API 失败: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %v", err)
	}

	// 检查 HTTP 状态码
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API 返回错误状态码: %d, 响应: %s", resp.StatusCode, string(body))
	}

	var token models.GitHubAccessToken
	err = json.Unmarshal(body, &token)
	if err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	if token.AccessToken == "" {
		return nil, fmt.Errorf("获取访问令牌失败，GitHub 返回: %s", string(body))
	}

	return &token, nil
}

// GetUserInfo 获取 GitHub 用户信息
func GetUserInfo(accessToken string) (*models.GitHubUserInfo, error) {
	if accessToken == "" {
		return nil, fmt.Errorf("访问令牌不能为空")
	}

	req, err := http.NewRequest("GET", GitHubUserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	// 设置超时时间
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求 GitHub API 失败: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %v", err)
	}

	// 检查 HTTP 状态码
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API 返回错误状态码: %d, 响应: %s", resp.StatusCode, string(body))
	}

	var userInfo models.GitHubUserInfo
	err = json.Unmarshal(body, &userInfo)
	if err != nil {
		return nil, fmt.Errorf("解析用户信息失败: %v", err)
	}

	// 验证必要字段
	if userInfo.ID == 0 {
		return nil, fmt.Errorf("获取用户信息失败，用户 ID 为空")
	}

	return &userInfo, nil
}
