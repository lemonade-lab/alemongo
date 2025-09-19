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
	data := url.Values{}
	data.Set("client_id", settings.Conf.GitHub.ClientID)
	data.Set("client_secret", settings.Conf.GitHub.ClientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", settings.Conf.GitHub.RedirectURL)

	req, err := http.NewRequest("POST", GitHubTokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var token models.GitHubAccessToken
	err = json.Unmarshal(body, &token)
	if err != nil {
		return nil, err
	}

	if token.AccessToken == "" {
		return nil, fmt.Errorf("获取访问令牌失败")
	}

	return &token, nil
}

// GetUserInfo 获取 GitHub 用户信息
func GetUserInfo(accessToken string) (*models.GitHubUserInfo, error) {
	req, err := http.NewRequest("GET", GitHubUserInfoURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo models.GitHubUserInfo
	err = json.Unmarshal(body, &userInfo)
	if err != nil {
		return nil, err
	}

	return &userInfo, nil
}
