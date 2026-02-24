package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/adapters/external/notion"
)

func executeAppNotion(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("notion: credentialId is required")
	}

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}

	if !strings.EqualFold(cred.Provider, "notion") {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("notion: expected notion credential, got %s", cred.Provider)
	}

	token := strings.TrimSpace(readAnyString(payload["access_token"]))
	if token == "" {
		token = strings.TrimSpace(readAnyString(payload["token"])) // API Key often stored as token
	}
	if token == "" {
		return map[string]any{"status": 0}, "missing token", errors.New("notion: access token missing in credential")
	}

	started := time.Now()
	var out map[string]any

	switch strings.ToLower(strings.TrimSpace(action)) {
	case "notion.createpage":
		// 'databaseId' is generic for 'parent' in our UI usually
		parentID := strings.TrimSpace(readString(config, "databaseId"))
		if parentID == "" {
			parentID = strings.TrimSpace(readString(config, "parentId"))
		}
		title := strings.TrimSpace(readString(config, "title"))
		content := readString(config, "content")

		if parentID == "" || title == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("notion.createPage: databaseId and title are required")
		}
		out, err = notion.CreatePage(ctx, token, parentID, title, content)

	default:
		return map[string]any{"status": 0}, "unsupported notion action", fmt.Errorf("app(notion): unsupported action %q", action)
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
		return outputs, "notion action failed", err
	}

	return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}
