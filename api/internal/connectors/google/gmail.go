package google

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

func SendEmail(ctx context.Context, accessToken string, from string, to string, subject string, bodyText string, bodyHTML string) (map[string]any, error) {
	raw := buildRawEmail(from, to, subject, bodyText, bodyHTML)
	payload := map[string]string{
		"raw": base64.RawURLEncoding.EncodeToString([]byte(raw)),
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", strings.NewReader(string(body)))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(io.LimitReader(res.Body, 64*1024))
		if len(bodyBytes) > 0 {
			var payload map[string]any
			if err := json.Unmarshal(bodyBytes, &payload); err == nil {
				if errObj, ok := payload["error"].(map[string]any); ok {
					if msg, ok := errObj["message"].(string); ok && strings.TrimSpace(msg) != "" {
						return nil, errors.New(msg)
					}
				}
				if msg, ok := payload["message"].(string); ok && strings.TrimSpace(msg) != "" {
					return nil, errors.New(msg)
				}
			}
			return nil, fmt.Errorf("gmail send error: %s (%s)", res.Status, strings.TrimSpace(string(bodyBytes)))
		}
		return nil, fmt.Errorf("gmail send error: %s", res.Status)
	}
	var out map[string]any
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func GetProfile(ctx context.Context, accessToken string) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://gmail.googleapis.com/gmail/v1/users/me/profile", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(io.LimitReader(res.Body, 64*1024))
		if len(bodyBytes) > 0 {
			var payload map[string]any
			if err := json.Unmarshal(bodyBytes, &payload); err == nil {
				if errObj, ok := payload["error"].(map[string]any); ok {
					if msg, ok := errObj["message"].(string); ok && strings.TrimSpace(msg) != "" {
						return nil, errors.New(msg)
					}
				}
				if msg, ok := payload["message"].(string); ok && strings.TrimSpace(msg) != "" {
					return nil, errors.New(msg)
				}
			}
			return nil, fmt.Errorf("gmail profile error: %s (%s)", res.Status, strings.TrimSpace(string(bodyBytes)))
		}
		return nil, fmt.Errorf("gmail profile error: %s", res.Status)
	}
	var out map[string]any
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func buildRawEmail(from string, to string, subject string, bodyText string, bodyHTML string) string {
	var b strings.Builder
	if from != "" {
		b.WriteString(fmt.Sprintf("From: %s\r\n", from))
	}
	b.WriteString(fmt.Sprintf("To: %s\r\n", to))
	b.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	b.WriteString("MIME-Version: 1.0\r\n")
	if strings.TrimSpace(bodyHTML) == "" {
		b.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n")
		b.WriteString(bodyText)
		return b.String()
	}
	boundary := fmt.Sprintf("gmail-%d", time.Now().UnixNano())
	b.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=%q\r\n\r\n", boundary))
	b.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	b.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n")
	b.WriteString(bodyText)
	b.WriteString("\r\n")
	b.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	b.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n")
	b.WriteString(bodyHTML)
	b.WriteString("\r\n")
	b.WriteString(fmt.Sprintf("--%s--\r\n", boundary))
	return b.String()
}
