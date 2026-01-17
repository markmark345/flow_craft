package google

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
	userInfoURL   = UserInfoEndpoint
)

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

type UserProfile struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	GivenName  string `json:"given_name"`
	FamilyName string `json:"family_name"`
	Picture    string `json:"picture"`
}

func BuildAuthURL(clientID string, redirectURL string, state string, scopes []string, promptConsent bool) string {
	q := url.Values{}
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirectURL)
	q.Set("response_type", "code")
	q.Set("access_type", "offline")
	q.Set("include_granted_scopes", "true")
	if promptConsent {
		q.Set("prompt", "consent")
	}
	if state != "" {
		q.Set("state", state)
	}
	if len(scopes) > 0 {
		q.Set("scope", strings.Join(scopes, " "))
	}
	return authEndpoint + "?" + q.Encode()
}

func ExchangeCode(ctx context.Context, clientID string, clientSecret string, redirectURL string, code string) (TokenResponse, error) {
	return exchangeToken(ctx, clientID, clientSecret, url.Values{
		"grant_type":   {"authorization_code"},
		"code":         {code},
		"redirect_uri": {redirectURL},
	})
}

func RefreshAccessToken(ctx context.Context, clientID string, clientSecret string, refreshToken string) (TokenResponse, error) {
	return exchangeToken(ctx, clientID, clientSecret, url.Values{
		"grant_type":    {"refresh_token"},
		"refresh_token": {refreshToken},
	})
}

func FetchUserProfile(ctx context.Context, accessToken string) (UserProfile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, userInfoURL, nil)
	if err != nil {
		return UserProfile{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return UserProfile{}, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return UserProfile{}, fmt.Errorf("google userinfo error: %s", res.Status)
	}
	var profile UserProfile
	if err := json.NewDecoder(res.Body).Decode(&profile); err != nil {
		return UserProfile{}, err
	}
	if strings.TrimSpace(profile.Email) == "" {
		return UserProfile{}, errors.New("google userinfo missing email")
	}
	return profile, nil
}

func exchangeToken(ctx context.Context, clientID string, clientSecret string, values url.Values) (TokenResponse, error) {
	values.Set("client_id", clientID)
	values.Set("client_secret", clientSecret)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, tokenEndpoint, strings.NewReader(values.Encode()))
	if err != nil {
		return TokenResponse{}, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return TokenResponse{}, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		var payload map[string]any
		_ = json.NewDecoder(res.Body).Decode(&payload)
		if msg, ok := payload["error_description"].(string); ok && msg != "" {
			return TokenResponse{}, errors.New(msg)
		}
		if msg, ok := payload["error"].(string); ok && msg != "" {
			return TokenResponse{}, errors.New(msg)
		}
		return TokenResponse{}, fmt.Errorf("google token error: %s", res.Status)
	}
	var token TokenResponse
	if err := json.NewDecoder(res.Body).Decode(&token); err != nil {
		return TokenResponse{}, err
	}
	return token, nil
}
