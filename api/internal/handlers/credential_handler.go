package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/connectors/github"
	"flowcraft-api/internal/connectors/google"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/services"
	"flowcraft-api/internal/utils"
)

type CredentialHandler struct {
	creds *services.CredentialService
	cfg   config.Config
}

func NewCredentialHandler(creds *services.CredentialService, cfg config.Config) *CredentialHandler {
	return &CredentialHandler{creds: creds, cfg: cfg}
}

func (h *CredentialHandler) Register(r *gin.RouterGroup) {
	r.GET("/credentials", h.list)
	r.POST("/credentials", h.create)
	r.GET("/credentials/:id", h.get)
	r.PUT("/credentials/:id", h.update)
	r.DELETE("/credentials/:id", h.delete)
	r.POST("/credentials/oauth/:provider/start", h.oauthStart)
}

func (h *CredentialHandler) list(c *gin.Context) {
	scope := strings.TrimSpace(c.Query("scope"))
	projectID := strings.TrimSpace(c.Query("projectId"))
	user, _ := currentAuthUser(c)
	items, err := h.creds.ListScoped(c, user, scope, projectID)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	out := make([]dto.CredentialResponse, 0, len(items))
	for _, cred := range items {
		out = append(out, credentialToResponse(h.creds, cred))
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *CredentialHandler) get(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	cred, err := h.creds.Get(c, user, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "credential not found"}})
		return
	}
	if err == utils.ErrForbidden {
		c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: credentialToResponse(h.creds, *cred)})
}

func (h *CredentialHandler) create(c *gin.Context) {
	user, _ := currentAuthUser(c)
	var req dto.CredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	if len(req.Data) == 0 {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "credential data is required"}})
		return
	}
	enc, err := h.creds.EncryptPayload(req.Data)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	cred := entities.Credential{
		ID:            utils.NewUUID(),
		Provider:      strings.TrimSpace(req.Provider),
		Name:          strings.TrimSpace(req.Name),
		ProjectID:     strings.TrimSpace(req.ProjectID),
		DataEncrypted: enc,
	}
	created, err := h.creds.Create(c, user, req.Scope, req.ProjectID, cred)
	if err == utils.ErrForbidden {
		c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: credentialToResponse(h.creds, created)})
}

func (h *CredentialHandler) update(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	var req dto.CredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	var enc string
	var err error
	if len(req.Data) > 0 {
		enc, err = h.creds.EncryptPayload(req.Data)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
			return
		}
	}
	cred := entities.Credential{
		ID:            id,
		Provider:      strings.TrimSpace(req.Provider),
		Name:          strings.TrimSpace(req.Name),
		DataEncrypted: enc,
	}
	if err := h.creds.Update(c, user, cred); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "credential not found"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	credUpdated, _ := h.creds.Get(c, user, id)
	if credUpdated == nil {
		c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: credentialToResponse(h.creds, *credUpdated)})
}

func (h *CredentialHandler) delete(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	if err := h.creds.Delete(c, user, id); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "credential not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
}

func (h *CredentialHandler) oauthStart(c *gin.Context) {
	user, _ := currentAuthUser(c)
	provider := strings.TrimSpace(c.Param("provider"))
	var req dto.CredentialOAuthStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	stateSecret := []byte(h.cfg.OAuthStateSecret)
	if len(stateSecret) == 0 {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "oauth state secret not configured"}})
		return
	}
	nonce, err := utils.GenerateToken(16)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	scope := strings.TrimSpace(req.Scope)
	projectID := strings.TrimSpace(req.ProjectID)
	payload := utils.OAuthStatePayload{
		Intent:    "credential",
		Provider:  provider,
		UserID:    user.ID,
		Scope:     scope,
		ProjectID: projectID,
		ReturnTo:  sanitizeReturnTo(req.ReturnTo, "/settings/credentials"),
		Name:      strings.TrimSpace(req.Name),
		Nonce:     nonce,
		Timestamp: time.Now().UTC().Unix(),
	}
	state, err := utils.EncodeOAuthState(stateSecret, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	var url string
	switch provider {
	case "google":
		if h.cfg.GoogleClientID == "" || h.cfg.GoogleClientSecret == "" || h.cfg.GoogleRedirectURL == "" {
			c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "google oauth not configured"}})
			return
		}
		scopes := []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/gmail.send",
			"https://www.googleapis.com/auth/spreadsheets",
		}
		url = google.BuildAuthURL(h.cfg.GoogleClientID, h.cfg.GoogleRedirectURL, state, scopes, true)
	case "github":
		if h.cfg.GitHubClientID == "" || h.cfg.GitHubClientSecret == "" || h.cfg.GitHubRedirectURL == "" {
			c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "github oauth not configured"}})
			return
		}
		scopes := []string{"repo", "read:user", "user:email"}
		url = github.BuildAuthURL(h.cfg.GitHubClientID, h.cfg.GitHubRedirectURL, state, scopes)
	default:
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "unsupported provider"}})
		return
	}

	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.OAuthStartResponse{URL: url}})
}

func credentialToResponse(svc *services.CredentialService, cred entities.Credential) dto.CredentialResponse {
	scope := "personal"
	if cred.ProjectID != "" {
		scope = "project"
	}
	out := dto.CredentialResponse{
		ID:        cred.ID,
		Provider:  cred.Provider,
		Name:      cred.Name,
		Scope:     scope,
		ProjectID: cred.ProjectID,
		CreatedAt: cred.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: cred.UpdatedAt.UTC().Format(time.RFC3339),
	}
	var payload map[string]any
	if err := svc.DecryptPayload(cred.DataEncrypted, &payload); err == nil {
		if v, ok := payload["account_email"].(string); ok {
			out.AccountEmail = v
		} else if v, ok := payload["account_login"].(string); ok {
			out.AccountEmail = v
		}
	}
	return out
}
