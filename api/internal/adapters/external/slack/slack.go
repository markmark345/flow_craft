package slack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const baseURL = "https://slack.com/api"

// SendMessage posts a message to a public channel, private channel, or direct message/IM channel.
// scopes: chat:write
func SendMessage(ctx context.Context, token string, channel string, text string) (map[string]any, error) {
	url := fmt.Sprintf("%s/chat.postMessage", baseURL)

	body := map[string]any{
		"channel": channel,
		"text":    text,
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json; charset=utf-8")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("slack api error: status %d", resp.StatusCode)
	}

	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode slack response: %w", err)
	}

	if ok, _ := result["ok"].(bool); !ok {
		errStr, _ := result["error"].(string)
		return nil, fmt.Errorf("slack api error: %s", errStr)
	}

	return result, nil
}
