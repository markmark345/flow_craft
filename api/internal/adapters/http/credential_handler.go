package httpadapter

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/adapters/external/github"
	"flowcraft-api/internal/adapters/external/google"
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
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
	items, err := h.creds.ListScoped(c.Request.Context(), user, scope, projectID)
	if err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	out := make([]dto.CredentialResponse, 0, len(items))
	for _, cred := range items {
		out = append(out, credentialToResponse(h.creds, cred))
	}
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *CredentialHandler) get(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	cred, err := h.creds.Get(c.Request.Context(), user, id)
	if err == utils.ErrNotFound {
		utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "credential not found", nil)
		return
	}
	if err == utils.ErrForbidden {
		utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, credentialToResponse(h.creds, *cred))
}

func (h *CredentialHandler) create(c *gin.Context) {
	user, _ := currentAuthUser(c)
	var req dto.CredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	if len(req.Data) == 0 {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "credential data is required", nil)
		return
	}
	enc, err := h.creds.EncryptPayload(req.Data)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	cred := domain.Credential{
		ID:            utils.NewUUID(),
		Provider:      strings.TrimSpace(req.Provider),
		Name:          strings.TrimSpace(req.Name),
		ProjectID:     strings.TrimSpace(req.ProjectID),
		DataEncrypted: enc,
	}
	created, err := h.creds.Create(c.Request.Context(), user, req.Scope, req.ProjectID, cred)
	if err == utils.ErrForbidden {
		utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, credentialToResponse(h.creds, created))
}

func (h *CredentialHandler) update(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	var req dto.CredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	var enc string
	var err error
	if len(req.Data) > 0 {
		enc, err = h.creds.EncryptPayload(req.Data)
		if err != nil {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
	}
	cred := domain.Credential{
		ID:            id,
		Provider:      strings.TrimSpace(req.Provider),
		Name:          strings.TrimSpace(req.Name),
		DataEncrypted: enc,
	}
	if err := h.creds.Update(c.Request.Context(), user, cred); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "credential not found", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	credUpdated, _ := h.creds.Get(c.Request.Context(), user, id)
	if credUpdated == nil {
		utils.JSONResponse(c, http.StatusOK, gin.H{"id": id})
		return
	}
	utils.JSONResponse(c, http.StatusOK, credentialToResponse(h.creds, *credUpdated))
}

func (h *CredentialHandler) delete(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	if err := h.creds.Delete(c.Request.Context(), user, id); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "credential not found", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"id": id})
}

func (h *CredentialHandler) oauthStart(c *gin.Context) {
	user, _ := currentAuthUser(c)
	provider := strings.TrimSpace(c.Param("provider"))
	var req dto.CredentialOAuthStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	stateSecret := []byte(h.cfg.OAuthStateSecret)
	if len(stateSecret) == 0 {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "oauth state secret not configured", nil)
		return
	}
	nonce, err := utils.GenerateToken(16)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
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
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	var url string
	switch provider {
	case "google":
		if h.cfg.GoogleClientID == "" || h.cfg.GoogleClientSecret == "" || h.cfg.GoogleRedirectURL == "" {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "google oauth not configured", nil)
			return
		}
		scopes := []string{
			google.ScopeUserInfoEmail,
			google.ScopeGmailSend,
			google.ScopeSheets,
		}
		url = google.BuildAuthURL(h.cfg.GoogleClientID, h.cfg.GoogleRedirectURL, state, scopes, true)
	case "github":
		if h.cfg.GitHubClientID == "" || h.cfg.GitHubClientSecret == "" || h.cfg.GitHubRedirectURL == "" {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "github oauth not configured", nil)
			return
		}
		scopes := []string{"repo", "read:user", "user:email"}
		url = github.BuildAuthURL(h.cfg.GitHubClientID, h.cfg.GitHubRedirectURL, state, scopes)
	default:
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "unsupported provider", nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, dto.OAuthStartResponse{URL: url})
}

func credentialToResponse(svc *services.CredentialService, cred domain.Credential) dto.CredentialResponse {
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
