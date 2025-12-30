package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/connectors/bannerbear"
	"flowcraft-api/internal/connectors/gemini"
	"flowcraft-api/internal/connectors/github"
	"flowcraft-api/internal/connectors/google"
	"flowcraft-api/internal/connectors/openai"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/services"
)

type NodeTestHandler struct {
	creds *services.CredentialService
	cfg   config.Config
}

func NewNodeTestHandler(creds *services.CredentialService, cfg config.Config) *NodeTestHandler {
	return &NodeTestHandler{creds: creds, cfg: cfg}
}

func (h *NodeTestHandler) Register(r *gin.RouterGroup) {
	r.POST("/nodes/test", h.test)
}

type nodeTestRequest struct {
	Kind         string         `json:"kind"`
	Provider     string         `json:"provider"`
	Action       string         `json:"action,omitempty"`
	CredentialID string         `json:"credentialId,omitempty"`
	APIKey       string         `json:"apiKeyOverride,omitempty"`
	BaseURL      string         `json:"baseUrl,omitempty"`
	Model        string         `json:"model,omitempty"`
	Config       map[string]any `json:"config,omitempty"`
	PerformWrite bool           `json:"performWrite,omitempty"`
}

type nodeTestResult struct {
	Success bool `json:"success"`
	Message string `json:"message"`
	Preview any    `json:"preview,omitempty"`
	Output  any    `json:"output,omitempty"`
}

func (h *NodeTestHandler) test(c *gin.Context) {
	var req nodeTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	req.Kind = strings.TrimSpace(req.Kind)
	req.Provider = strings.TrimSpace(req.Provider)
	req.Action = strings.TrimSpace(req.Action)
	req.CredentialID = strings.TrimSpace(req.CredentialID)
	req.APIKey = strings.TrimSpace(req.APIKey)
	req.BaseURL = strings.TrimSpace(req.BaseURL)
	req.Model = strings.TrimSpace(req.Model)
	if req.Config == nil {
		req.Config = map[string]any{}
	}

	var result nodeTestResult
	switch req.Kind {
	case "app-action", "agent-tool":
		result = h.testAppAction(c, user, req)
	case "agent-model":
		result = h.testAgentModel(c, user, req)
	default:
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "invalid kind"}})
		return
	}

	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: result})
}

func (h *NodeTestHandler) testAppAction(c *gin.Context, user services.AuthUser, req nodeTestRequest) nodeTestResult {
	provider := normalizeAppProvider(req.Provider)
	action := strings.ToLower(req.Action)
	_ = action

	switch provider {
	case "gmail":
		if req.CredentialID == "" {
			return nodeTestResult{Success: false, Message: "credentialId is required"}
		}
		credProvider, payload, err := h.loadCredentialPayload(c, user, req.CredentialID)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		if !strings.EqualFold(credProvider, "google") {
			return nodeTestResult{Success: false, Message: "expected google credential"}
		}
		accessToken, err := h.googleAccessToken(c, payload)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		profile, err := google.GetProfile(c, accessToken)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		email := strings.TrimSpace(readAnyString(profile["emailAddress"]))
		if email == "" {
			email = strings.TrimSpace(readAnyString(profile["email"]))
		}
		msg := "Connected to Gmail"
		if email != "" {
			msg = fmt.Sprintf("Connected to Gmail (%s)", email)
		}
		return nodeTestResult{Success: true, Message: msg, Preview: map[string]any{"email": email}}
	case "googleSheets":
		if req.CredentialID == "" {
			return nodeTestResult{Success: false, Message: "credentialId is required"}
		}
		credProvider, payload, err := h.loadCredentialPayload(c, user, req.CredentialID)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		if !strings.EqualFold(credProvider, "google") {
			return nodeTestResult{Success: false, Message: "expected google credential"}
		}
		spreadsheetID := strings.TrimSpace(readAnyString(req.Config["spreadsheetId"]))
		if spreadsheetID == "" {
			return nodeTestResult{Success: false, Message: "spreadsheetId is required for Sheets test"}
		}
		sheetName := strings.TrimSpace(readAnyString(req.Config["sheetName"]))
		if sheetName == "" {
			sheetName = "Sheet1"
		}
		accessToken, err := h.googleAccessToken(c, payload)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		sheetID, err := google.ResolveSheetID(c, accessToken, spreadsheetID, sheetName)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		return nodeTestResult{
			Success: true,
			Message: fmt.Sprintf("Connected to Google Sheets (%s)", sheetName),
			Preview: map[string]any{
				"spreadsheetId": spreadsheetID,
				"sheetName":     sheetName,
				"sheetId":       sheetID,
			},
		}
	case "github":
		if req.CredentialID == "" {
			return nodeTestResult{Success: false, Message: "credentialId is required"}
		}
		credProvider, payload, err := h.loadCredentialPayload(c, user, req.CredentialID)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		if !strings.EqualFold(credProvider, "github") {
			return nodeTestResult{Success: false, Message: "expected github credential"}
		}
		accessToken := strings.TrimSpace(readAnyString(payload["access_token"]))
		if accessToken == "" {
			return nodeTestResult{Success: false, Message: "github credential missing access token"}
		}
		owner := strings.TrimSpace(readAnyString(req.Config["owner"]))
		repo := strings.TrimSpace(readAnyString(req.Config["repo"]))
		if owner == "" || repo == "" {
			return nodeTestResult{Success: false, Message: "owner and repo are required for GitHub test"}
		}
		repoInfo, err := github.GetRepo(c, accessToken, owner, repo)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		fullName := strings.TrimSpace(readAnyString(repoInfo["full_name"]))
		if fullName == "" {
			fullName = fmt.Sprintf("%s/%s", owner, repo)
		}
		return nodeTestResult{Success: true, Message: fmt.Sprintf("Connected to GitHub (%s)", fullName), Preview: repoInfo}
	case "bannerbear":
		apiKey := strings.TrimSpace(readAnyString(req.Config["apiKey"]))
		if apiKey == "" && req.CredentialID != "" {
			credProvider, payload, err := h.loadCredentialPayload(c, user, req.CredentialID)
			if err != nil {
				return nodeTestResult{Success: false, Message: err.Error()}
			}
			if !strings.EqualFold(credProvider, "bannerbear") {
				return nodeTestResult{Success: false, Message: "expected bannerbear credential"}
			}
			apiKey = strings.TrimSpace(readAnyString(payload["api_key"]))
			if apiKey == "" {
				apiKey = strings.TrimSpace(readAnyString(payload["apiKey"]))
			}
		}
		if apiKey == "" {
			return nodeTestResult{Success: false, Message: "credentialId or apiKey is required"}
		}
		templateUID := strings.TrimSpace(readAnyString(req.Config["templateUid"]))
		if templateUID != "" {
			out, _, err := bannerbear.GetTemplate(c, apiKey, templateUID)
			if err != nil {
				return nodeTestResult{Success: false, Message: err.Error()}
			}
			return nodeTestResult{Success: true, Message: "Connected to Bannerbear", Preview: out}
		}
		out, _, err := bannerbear.ListTemplates(c, apiKey, 1, 1)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		return nodeTestResult{Success: true, Message: "Connected to Bannerbear", Preview: out}
	default:
		return nodeTestResult{Success: false, Message: fmt.Sprintf("unsupported provider %q", req.Provider)}
	}
}

func (h *NodeTestHandler) testAgentModel(c *gin.Context, user services.AuthUser, req nodeTestRequest) nodeTestResult {
	provider := strings.ToLower(strings.TrimSpace(req.Provider))
	model := strings.TrimSpace(req.Model)
	if provider == "" {
		return nodeTestResult{Success: false, Message: "provider is required"}
	}
	if model == "" {
		return nodeTestResult{Success: false, Message: "model is required"}
	}
	if req.CredentialID == "" && req.APIKey == "" {
		return nodeTestResult{Success: false, Message: "credentialId or apiKeyOverride is required"}
	}

	apiKey := req.APIKey
	if apiKey == "" && req.CredentialID != "" {
		credProvider, payload, err := h.loadCredentialPayload(c, user, req.CredentialID)
		if err != nil {
			return nodeTestResult{Success: false, Message: err.Error()}
		}
		if provider != "custom" && !strings.EqualFold(credProvider, provider) {
			return nodeTestResult{Success: false, Message: fmt.Sprintf("expected %s credential", provider)}
		}
		apiKey = strings.TrimSpace(readAnyString(payload["api_key"]))
		if apiKey == "" {
			apiKey = strings.TrimSpace(readAnyString(payload["apiKey"]))
		}
	}
	if strings.TrimSpace(apiKey) == "" {
		return nodeTestResult{Success: false, Message: "api key missing"}
	}

	baseURL := strings.TrimRight(strings.TrimSpace(req.BaseURL), "/")
	switch provider {
	case "openai", "custom":
		if baseURL == "" {
			baseURL = openai.DefaultBaseURL
		}
	case "grok":
		if baseURL == "" {
			baseURL = "https://api.x.ai/v1"
		}
	case "gemini":
		if baseURL == "" {
			baseURL = gemini.DefaultBaseURL
		}
	default:
		return nodeTestResult{Success: false, Message: fmt.Sprintf("unsupported provider %q", provider)}
	}

	started := time.Now()
	var raw any
	var status int
	var err error
	switch provider {
	case "openai", "grok", "custom":
		payload := map[string]any{
			"model": model,
			"messages": []any{
				map[string]any{"role": "user", "content": "Respond with OK."},
			},
			"temperature": 0,
			"max_tokens":  16,
		}
		raw, status, err = openai.ChatCompletions(c, baseURL, apiKey, payload)
	case "gemini":
		payload := map[string]any{
			"contents": []any{
				map[string]any{
					"role": "user",
					"parts": []any{map[string]any{"text": "Respond with OK."}},
				},
			},
			"generationConfig": map[string]any{
				"temperature":      0,
				"maxOutputTokens":  16,
				"responseMimeType": "text/plain",
			},
		}
		raw, status, err = gemini.GenerateContent(c, baseURL, apiKey, model, payload)
	}
	duration := time.Since(started)
	if err != nil {
		return nodeTestResult{
			Success: false,
			Message: err.Error(),
			Output:  raw,
		}
	}

	return nodeTestResult{
		Success: true,
		Message: fmt.Sprintf("Model test succeeded (%s) in %dms", provider, duration.Milliseconds()),
		Preview: map[string]any{
			"provider": provider,
			"model":    model,
			"status":   status,
		},
		Output: raw,
	}
}

func (h *NodeTestHandler) loadCredentialPayload(ctx *gin.Context, user services.AuthUser, credentialID string) (string, map[string]any, error) {
	if h.creds == nil {
		return "", nil, errors.New("credential service not configured")
	}
	cred, err := h.creds.Get(ctx, user, credentialID)
	if err != nil {
		return "", nil, err
	}
	var payload map[string]any
	if err := h.creds.DecryptPayload(cred.DataEncrypted, &payload); err != nil {
		return "", nil, err
	}
	return cred.Provider, payload, nil
}

func (h *NodeTestHandler) googleAccessToken(ctx *gin.Context, payload map[string]any) (string, error) {
	refreshToken := strings.TrimSpace(readAnyString(payload["refresh_token"]))
	if refreshToken == "" {
		return "", errors.New("missing google refresh token")
	}
	if strings.TrimSpace(h.cfg.GoogleClientID) == "" || strings.TrimSpace(h.cfg.GoogleClientSecret) == "" {
		return "", errors.New("google oauth not configured")
	}
	token, err := google.RefreshAccessToken(ctx, h.cfg.GoogleClientID, h.cfg.GoogleClientSecret, refreshToken)
	if err != nil {
		return "", err
	}
	accessToken := strings.TrimSpace(token.AccessToken)
	if accessToken == "" {
		return "", errors.New("google access token missing")
	}
	return accessToken, nil
}

func normalizeAppProvider(raw string) string {
	v := strings.ToLower(strings.TrimSpace(raw))
	switch v {
	case "gmail":
		return "gmail"
	case "google-sheets", "google_sheets", "googlesheets", "googlesheet", "gsheets", "sheets":
		return "googleSheets"
	case "github":
		return "github"
	case "bannerbear", "bananabear":
		return "bannerbear"
	default:
		return v
	}
}

func readAnyString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}
