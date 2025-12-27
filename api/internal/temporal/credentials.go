package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"flowcraft-api/internal/connectors/google"
	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

func loadCredentialPayload(ctx context.Context, deps stepDependencies, credentialID string) (entities.Credential, map[string]any, error) {
	if deps.creds == nil {
		return entities.Credential{}, nil, errors.New("credentials repository not configured")
	}
	if len(deps.credsKey) == 0 {
		return entities.Credential{}, nil, errors.New("credentials encryption key not configured")
	}
	cred, err := deps.creds.Get(ctx, credentialID)
	if err != nil {
		return entities.Credential{}, nil, err
	}
	var payload map[string]any
	if err := utils.DecryptJSON(deps.credsKey, cred.DataEncrypted, &payload); err != nil {
		return entities.Credential{}, nil, err
	}
	return *cred, payload, nil
}

func googleAccessToken(ctx context.Context, deps stepDependencies, payload map[string]any) (string, error) {
	refreshToken := strings.TrimSpace(readAnyString(payload["refresh_token"]))
	if refreshToken == "" {
		return "", errors.New("missing google refresh token")
	}
	if strings.TrimSpace(deps.cfg.GoogleClientID) == "" || strings.TrimSpace(deps.cfg.GoogleClientSecret) == "" {
		return "", errors.New("google oauth client not configured")
	}
	token, err := google.RefreshAccessToken(ctx, deps.cfg.GoogleClientID, deps.cfg.GoogleClientSecret, refreshToken)
	if err != nil {
		return "", err
	}
	accessToken := strings.TrimSpace(token.AccessToken)
	if accessToken == "" {
		return "", fmt.Errorf("google access token missing")
	}
	return accessToken, nil
}
