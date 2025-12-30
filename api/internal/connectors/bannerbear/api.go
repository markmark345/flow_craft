package bannerbear

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

const defaultBaseURL = "https://api.bannerbear.com/v2"

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
	if strings.TrimSpace(apiKey) != "" {
		req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(apiKey))
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "FlowCraft")
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{Timeout: 20 * time.Second}
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
				return nil, res.StatusCode, fmt.Errorf("bannerbear error: %s", msg)
			}
			if errMsg, ok := m["error"].(string); ok && errMsg != "" {
				return nil, res.StatusCode, fmt.Errorf("bannerbear error: %s", errMsg)
			}
		}
		return nil, res.StatusCode, fmt.Errorf("bannerbear error: %s", res.Status)
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

func CreateImage(ctx context.Context, apiKey string, templateUID string, modifications any, webhookURL string) (map[string]any, int, error) {
	payload := map[string]any{
		"template": strings.TrimSpace(templateUID),
	}
	if modifications != nil {
		payload["modifications"] = modifications
	}
	if strings.TrimSpace(webhookURL) != "" {
		payload["webhook_url"] = strings.TrimSpace(webhookURL)
	}
	out, code, err := doJSON(ctx, apiKey, http.MethodPost, defaultBaseURL+"/images", payload)
	return coerceMap(out), code, err
}

func GetImage(ctx context.Context, apiKey string, imageUID string) (map[string]any, int, error) {
	target := defaultBaseURL + "/images/" + url.PathEscape(strings.TrimSpace(imageUID))
	out, code, err := doJSON(ctx, apiKey, http.MethodGet, target, nil)
	return coerceMap(out), code, err
}

func GetTemplate(ctx context.Context, apiKey string, templateUID string) (map[string]any, int, error) {
	target := defaultBaseURL + "/templates/" + url.PathEscape(strings.TrimSpace(templateUID))
	out, code, err := doJSON(ctx, apiKey, http.MethodGet, target, nil)
	return coerceMap(out), code, err
}

func ListTemplates(ctx context.Context, apiKey string, page int, perPage int) (map[string]any, int, error) {
	u, _ := url.Parse(defaultBaseURL + "/templates")
	q := u.Query()
	if page > 0 {
		q.Set("page", fmt.Sprint(page))
	}
	if perPage > 0 {
		q.Set("per_page", fmt.Sprint(perPage))
	}
	u.RawQuery = q.Encode()
	out, code, err := doJSON(ctx, apiKey, http.MethodGet, u.String(), nil)
	return coerceMap(out), code, err
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
