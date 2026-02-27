package temporal

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func executeHTTPRequest(ctx context.Context, config map[string]any) (map[string]any, string, error) {
	method := strings.ToUpper(strings.TrimSpace(readString(config, "method")))
	if method == "" {
		method = http.MethodGet
	}

	rawURL := strings.TrimSpace(readString(config, "url"))
	if rawURL == "" {
		return map[string]any{"status": 0}, "missing url", fmt.Errorf("httpRequest: url is required")
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return map[string]any{"status": 0}, "invalid url", fmt.Errorf("httpRequest: invalid url: %w", err)
	}
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return map[string]any{"status": 0}, "unsupported scheme", fmt.Errorf("httpRequest: only http/https urls are allowed")
	}

	queryParams := parseKeyValuePairsFromConfig(config, "queryParams")
	if len(queryParams) > 0 {
		q := parsedURL.Query()
		for _, p := range queryParams {
			k := strings.TrimSpace(p.Key)
			if k == "" {
				continue
			}
			q.Set(k, p.Value)
		}
		parsedURL.RawQuery = q.Encode()
	}
	finalURL := parsedURL.String()

	headers := parseStringMapFromConfig(config, "headers")
	body := readString(config, "body")

	// Authentication handling
	authType := strings.TrimSpace(readString(config, "authType"))
	authValue := strings.TrimSpace(readString(config, "authValue"))
	authHeader := strings.TrimSpace(readString(config, "authHeader"))
	if authHeader == "" {
		authHeader = "X-API-Key"
	}

	switch strings.ToLower(authType) {
	case "api key":
		if authValue != "" {
			headers[authHeader] = authValue
		}
	case "bearer token":
		if authValue != "" {
			headers["Authorization"] = "Bearer " + authValue
		}
	case "basic auth":
		if authValue != "" {
			encoded := base64.StdEncoding.EncodeToString([]byte(authValue))
			headers["Authorization"] = "Basic " + encoded
		}
	}

	var bodyReader io.Reader
	if strings.TrimSpace(body) != "" && method != http.MethodGet && method != http.MethodHead {
		bodyReader = bytes.NewReader([]byte(body))
	}

	req, err := http.NewRequestWithContext(ctx, method, finalURL, bodyReader)
	if err != nil {
		return map[string]any{"status": 0}, "request build failed", fmt.Errorf("httpRequest: %w", err)
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	// Content-Type handling
	contentType := strings.TrimSpace(readString(config, "contentType"))
	if bodyReader != nil && req.Header.Get("Content-Type") == "" {
		if contentType != "" {
			req.Header.Set("Content-Type", contentType)
		} else {
			trim := strings.TrimSpace(body)
			if strings.HasPrefix(trim, "{") || strings.HasPrefix(trim, "[") {
				req.Header.Set("Content-Type", "application/json")
			} else {
				req.Header.Set("Content-Type", "text/plain; charset=utf-8")
			}
		}
	}
	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", "FlowCraft/0.1")
	}

	// Timeout handling
	timeout := 12 * time.Second
	if rawTimeout, ok := config["timeout"]; ok && rawTimeout != nil {
		switch v := rawTimeout.(type) {
		case float64:
			if v > 0 && v <= 120 {
				timeout = time.Duration(v) * time.Second
			}
		case int:
			if v > 0 && v <= 120 {
				timeout = time.Duration(v) * time.Second
			}
		}
	}
	client := &http.Client{Timeout: timeout}
	started := time.Now()
	res, err := client.Do(req)
	duration := time.Since(started)
	if err != nil {
		return map[string]any{"status": 0, "error": err.Error()}, "request failed", err
	}
	defer res.Body.Close()

	const maxBodyBytes = 512 * 1024
	bodyBytes, _ := io.ReadAll(io.LimitReader(res.Body, maxBodyBytes))

	parsedBody := parseJSONOrString(string(bodyBytes))
	outputs := map[string]any{
		"status": res.StatusCode,
		"data":   parsedBody,
		"meta": map[string]any{
			"duration_ms":  duration.Milliseconds(),
			"content_type": res.Header.Get("Content-Type"),
		},
	}

	logText := fmt.Sprintf("%s %s -> %d (%dms)", method, finalURL, res.StatusCode, duration.Milliseconds())
	if res.StatusCode >= 400 {
		return outputs, logText, fmt.Errorf("httpRequest: received HTTP %d", res.StatusCode)
	}
	return outputs, logText, nil
}

type keyValuePair struct {
	Key   string
	Value string
}

func buildURLWithQuery(rawURL string, params []keyValuePair) (string, error) {
	if len(params) == 0 {
		return rawURL, nil
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL, err
	}
	q := u.Query()
	for _, p := range params {
		k := strings.TrimSpace(p.Key)
		if k == "" {
			continue
		}
		q.Set(k, p.Value)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func pairsToStringMap(pairs []keyValuePair) map[string]string {
	if len(pairs) == 0 {
		return nil
	}
	out := make(map[string]string, len(pairs))
	for _, p := range pairs {
		k := strings.TrimSpace(p.Key)
		if k == "" {
			continue
		}
		out[k] = p.Value
	}
	return out
}

func parseKeyValuePairsFromConfig(cfg map[string]any, key string) []keyValuePair {
	if cfg == nil {
		return nil
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return nil
	}

	switch v := raw.(type) {
	case []any:
		out := make([]keyValuePair, 0, len(v))
		for _, item := range v {
			m, ok := item.(map[string]any)
			if !ok {
				if m2, ok := item.(map[string]string); ok {
					k := strings.TrimSpace(m2["key"])
					val := m2["value"]
					out = append(out, keyValuePair{Key: k, Value: val})
				}
				continue
			}
			k := strings.TrimSpace(readAnyString(m["key"]))
			val := readAnyString(m["value"])
			out = append(out, keyValuePair{Key: k, Value: val})
		}
		return out
	case map[string]any:
		out := make([]keyValuePair, 0, len(v))
		for k, val := range v {
			out = append(out, keyValuePair{Key: k, Value: readAnyString(val)})
		}
		return out
	case map[string]string:
		out := make([]keyValuePair, 0, len(v))
		for k, val := range v {
			out = append(out, keyValuePair{Key: k, Value: val})
		}
		return out
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" || trim == "{}" || trim == "[]" {
			return nil
		}
		var parsed any
		if err := json.Unmarshal([]byte(trim), &parsed); err != nil {
			return nil
		}
		return parseKeyValuePairsFromConfig(map[string]any{key: parsed}, key)
	default:
		return nil
	}
}

func parseStringMapFromConfig(cfg map[string]any, key string) map[string]string {
	if cfg == nil {
		return nil
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return nil
	}

	switch v := raw.(type) {
	case map[string]any:
		out := make(map[string]string, len(v))
		for k, val := range v {
			out[k] = readAnyString(val)
		}
		return out
	case map[string]string:
		out := make(map[string]string, len(v))
		for k, val := range v {
			out[k] = val
		}
		return out
	case []any:
		pairs := parseKeyValuePairsFromConfig(map[string]any{key: v}, key)
		return pairsToStringMap(pairs)
	case string:
		return parseJSONStringMap(v)
	default:
		return parseJSONStringMap(fmt.Sprint(v))
	}
}

func parseJSONStringMap(raw string) map[string]string {
	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "{}" {
		return nil
	}

	var obj map[string]any
	if err := json.Unmarshal([]byte(raw), &obj); err != nil {
		return nil
	}

	out := make(map[string]string, len(obj))
	for k, v := range obj {
		out[k] = readAnyString(v)
	}
	return out
}

func parseJSONOrString(v string) any {
	trim := strings.TrimSpace(v)
	if trim == "" {
		return ""
	}

	var out any
	if err := json.Unmarshal([]byte(trim), &out); err == nil {
		return out
	}
	return v
}
