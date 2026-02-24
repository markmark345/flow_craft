package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/adapters/external/slack"
)

func executeAppSlack(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("slack: credentialId is required")
	}

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}

	// Check provider name (case-insensitive)
	if !strings.EqualFold(cred.Provider, "slack") {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("slack: expected slack credential, got %s", cred.Provider)
	}

	token := strings.TrimSpace(readAnyString(payload["access_token"]))
	// Sometimes it might be called 'bot_token' or just 'token' depending on how we stored it.
	// For OAuth, it's usually access_token. For manual API Key, we might store it as 'token'.
	if token == "" {
		token = strings.TrimSpace(readAnyString(payload["token"]))
	}
	if token == "" {
		return map[string]any{"status": 0}, "missing token", errors.New("slack: access token missing in credential")
	}

	started := time.Now()
	var out map[string]any

	switch strings.ToLower(strings.TrimSpace(action)) {
	case "slack.sendmessage":
		channel := strings.TrimSpace(readString(config, "channel"))
		text := readString(config, "message") // UI might call it 'message' or 'text'
		if text == "" {
			text = readString(config, "text")
		}

		if channel == "" || text == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("slack.sendMessage: channel and message are required")
		}
		out, err = slack.SendMessage(ctx, token, channel, text)

	default:
		return map[string]any{"status": 0}, "unsupported slack action", fmt.Errorf("app(slack): unsupported action %q", action)
	}

	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "slack action failed", err
	}

	return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}
