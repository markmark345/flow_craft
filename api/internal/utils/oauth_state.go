package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

type OAuthStatePayload struct {
	Intent    string `json:"intent"`
	Provider  string `json:"provider"`
	UserID    string `json:"userId,omitempty"`
	Scope     string `json:"scope,omitempty"`
	ProjectID string `json:"projectId,omitempty"`
	Next      string `json:"next,omitempty"`
	ReturnTo  string `json:"returnTo,omitempty"`
	Name      string `json:"name,omitempty"`
	Nonce     string `json:"nonce"`
	Timestamp int64  `json:"ts"`
}

func EncodeOAuthState(secret []byte, payload OAuthStatePayload) (string, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	raw := base64.RawURLEncoding.EncodeToString(body)
	sig := signOAuthState(secret, raw)
	return raw + "." + sig, nil
}

func DecodeOAuthState(secret []byte, state string, maxAge time.Duration) (OAuthStatePayload, error) {
	var payload OAuthStatePayload
	if state == "" {
		return payload, errors.New("missing state")
	}
	parts := strings.Split(state, ".")
	if len(parts) != 2 {
		return payload, errors.New("invalid state")
	}
	body := parts[0]
	sig := parts[1]
	if !hmac.Equal([]byte(signOAuthState(secret, body)), []byte(sig)) {
		return payload, errors.New("invalid state signature")
	}
	raw, err := base64.RawURLEncoding.DecodeString(body)
	if err != nil {
		return payload, err
	}
	if err := json.Unmarshal(raw, &payload); err != nil {
		return payload, err
	}
	if maxAge > 0 {
		if payload.Timestamp == 0 {
			return payload, errors.New("state missing timestamp")
		}
		age := time.Since(time.Unix(payload.Timestamp, 0))
		if age < 0 || age > maxAge {
			return payload, errors.New("state expired")
		}
	}
	return payload, nil
}

func signOAuthState(secret []byte, payload string) string {
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
