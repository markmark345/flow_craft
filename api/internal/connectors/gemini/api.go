package gemini

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const DefaultBaseURL = "https://generativelanguage.googleapis.com"

func doJSON(ctx context.Context, apiKey string, method string, target string, payload any) (any, int, error) {
	var body *bytes.Reader
	if payload != nil {
		raw, err := json.Marshal(payload)
		if err != nil {
			return nil, 0, err
		}
		body = bytes.NewReader(raw)
	} else {
		body = bytes.NewReader(nil)
	}

	req, err := http.NewRequestWithContext(ctx, method, target, body)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "FlowCraft")
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		var decoded any
		_ = json.NewDecoder(res.Body).Decode(&decoded)
		if m, ok := decoded.(map[string]any); ok {
			if errObj, ok := m["error"].(map[string]any); ok {
				if msg, ok := errObj["message"].(string); ok && msg != "" {
					return nil, res.StatusCode, fmt.Errorf("gemini error: %s", msg)
				}
			}
			if msg, ok := m["message"].(string); ok && msg != "" {
				return nil, res.StatusCode, fmt.Errorf("gemini error: %s", msg)
			}
		}
		return nil, res.StatusCode, fmt.Errorf("gemini error: %s", res.Status)
	}

	if res.ContentLength == 0 || res.StatusCode == http.StatusNoContent {
		return map[string]any{"status": res.StatusCode}, res.StatusCode, nil
	}

	var decoded any
	if err := json.NewDecoder(res.Body).Decode(&decoded); err != nil {
		return nil, res.StatusCode, err
	}
	return decoded, res.StatusCode, nil
}

func baseURL(raw string) string {
	trim := strings.TrimSpace(raw)
	if trim == "" {
		return DefaultBaseURL
	}
	return strings.TrimRight(trim, "/")
}

func normalizeModel(raw string) string {
	trim := strings.TrimSpace(raw)
	trim = strings.TrimPrefix(trim, "models/")
	return trim
}

func GenerateContent(ctx context.Context, base string, apiKey string, model string, payload map[string]any) (any, int, error) {
	u, _ := url.Parse(baseURL(base) + "/v1beta/models/" + url.PathEscape(normalizeModel(model)) + ":generateContent")
	q := u.Query()
	q.Set("key", strings.TrimSpace(apiKey))
	u.RawQuery = q.Encode()
	return doJSON(ctx, "", http.MethodPost, u.String(), payload)
}
