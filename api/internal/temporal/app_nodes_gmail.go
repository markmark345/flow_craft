package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/connectors/google"
)

func executeGmail(ctx context.Context, config map[string]any, deps stepDependencies) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("gmail: credentialId is required")
	}
	to := strings.TrimSpace(readString(config, "to"))
	if to == "" {
		return map[string]any{"status": 0}, "missing recipient", errors.New("gmail: to is required")
	}
	subject := strings.TrimSpace(readString(config, "subject"))
	bodyText := readString(config, "bodyText")
	bodyHTML := readString(config, "bodyHtml")
	from := strings.TrimSpace(readString(config, "from"))

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "google" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("gmail: expected google credential")
	}
	accessToken, err := googleAccessToken(ctx, deps, payload)
	if err != nil {
		return map[string]any{"status": 0}, "token refresh failed", err
	}
	if from == "" {
		from = strings.TrimSpace(readAnyString(payload["account_email"]))
	}

	started := time.Now()
	out, err := google.SendEmail(ctx, accessToken, from, to, subject, bodyText, bodyHTML)
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
		return outputs, "gmail send failed", err
	}
	logText := fmt.Sprintf("gmail send -> %s (%dms)", to, duration.Milliseconds())
	return outputs, logText, nil
}
