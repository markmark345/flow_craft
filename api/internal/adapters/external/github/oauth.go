package github

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	authEndpoint  = AuthEndpoint
	tokenEndpoint = TokenEndpoint
	userEndpoint  = UserEndpoint
	emailEndpoint = EmailEndpoint
)

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
}

type UserProfile struct {
	ID    int64  `json:"id"`
	Login string `json:"login"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func BuildAuthURL(clientID string, redirectURL string, state string, scopes []string) string {
	q := url.Values{}
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirectURL)
	if state != "" {
		q.Set("state", state)
	}
	if len(scopes) > 0 {
		q.Set("scope", strings.Join(scopes, " "))
	}
	return authEndpoint + "?" + q.Encode()
}

func ExchangeCode(ctx context.Context, clientID string, clientSecret string, redirectURL string, code string) (TokenResponse, error) {
	values := url.Values{}
	values.Set("client_id", clientID)
	values.Set("client_secret", clientSecret)
	values.Set("code", code)
	if redirectURL != "" {
		values.Set("redirect_uri", redirectURL)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, tokenEndpoint, strings.NewReader(values.Encode()))
	if err != nil {
		return TokenResponse{}, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return TokenResponse{}, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return TokenResponse{}, fmt.Errorf("github token error: %s", res.Status)
	}
	var token TokenResponse
	if err := json.NewDecoder(res.Body).Decode(&token); err != nil {
		return TokenResponse{}, err
	}
	if token.AccessToken == "" {
		return TokenResponse{}, errors.New("github token missing")
	}
	return token, nil
}

func FetchUserProfile(ctx context.Context, accessToken string) (UserProfile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, userEndpoint, nil)
	if err != nil {
		return UserProfile{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "FlowCraft")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return UserProfile{}, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return UserProfile{}, fmt.Errorf("github user error: %s", res.Status)
	}
	var profile UserProfile
	if err := json.NewDecoder(res.Body).Decode(&profile); err != nil {
		return UserProfile{}, err
	}
	if strings.TrimSpace(profile.Email) == "" {
		email, _ := fetchPrimaryEmail(ctx, accessToken)
		profile.Email = email
	}
	return profile, nil
}

func fetchPrimaryEmail(ctx context.Context, accessToken string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, emailEndpoint, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "FlowCraft")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return "", fmt.Errorf("github email error: %s", res.Status)
	}
	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	if err := json.NewDecoder(res.Body).Decode(&emails); err != nil {
		return "", err
	}
	for _, e := range emails {
		if e.Primary && e.Verified && strings.TrimSpace(e.Email) != "" {
			return e.Email, nil
		}
	}
	for _, e := range emails {
		if e.Verified && strings.TrimSpace(e.Email) != "" {
			return e.Email, nil
		}
	}
	return "", errors.New("github email not available")
}
