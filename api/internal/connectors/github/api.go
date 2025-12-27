package github

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

func doJSON(ctx context.Context, accessToken string, method string, target string, payload any) (any, int, error) {
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
	if accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+accessToken)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "FlowCraft")
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		var decoded any
		_ = json.NewDecoder(res.Body).Decode(&decoded)
		if m, ok := decoded.(map[string]any); ok {
			if msg, ok := m["message"].(string); ok && msg != "" {
				return nil, res.StatusCode, fmt.Errorf("github error: %s", msg)
			}
		}
		return nil, res.StatusCode, fmt.Errorf("github error: %s", res.Status)
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

func coerceMap(decoded any) map[string]any {
	if decoded == nil {
		return map[string]any{}
	}
	if m, ok := decoded.(map[string]any); ok {
		return m
	}
	return map[string]any{"data": decoded}
}

func readAnyString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return strings.TrimSpace(fmt.Sprint(v))
}
