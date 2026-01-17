package httpadapter

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"

	"flowcraft-api/internal/adapters/external/github"
	"flowcraft-api/internal/adapters/external/google"
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
)

type AuthHandler struct {
	auth          *services.AuthService
	users         ports.UserRepository
	oauthAccounts ports.OAuthAccountRepository
	creds         *services.CredentialService
	cfg           config.Config
}

func NewAuthHandler(
	auth *services.AuthService,
	users ports.UserRepository,
	oauthAccounts ports.OAuthAccountRepository,
	creds *services.CredentialService,
	cfg config.Config,
) *AuthHandler {
	return &AuthHandler{auth: auth, users: users, oauthAccounts: oauthAccounts, creds: creds, cfg: cfg}
}

func (h *AuthHandler) Register(r *gin.RouterGroup) {
	r.POST("/auth/signup", h.signup)
	r.POST("/auth/login", h.login)
	r.GET("/auth/me", h.me)
	r.POST("/auth/logout", h.logout)
	r.POST("/auth/forgot-password", h.forgotPassword)
	r.POST("/auth/reset-password", h.resetPassword)
	r.GET("/auth/oauth/:provider/start", h.oauthStart)
	r.GET("/auth/oauth/:provider/callback", h.oauthCallback)
}

func bearerToken(c *gin.Context) string {
	raw := strings.TrimSpace(c.GetHeader("Authorization"))
	if raw == "" {
		return ""
	}
	parts := strings.SplitN(raw, " ", 2)
	if len(parts) != 2 {
		return ""
	}
	if strings.ToLower(strings.TrimSpace(parts[0])) != "bearer" {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

func toUserResponse(u domain.AuthUser) dto.UserResponse {
	return dto.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}
}

func (h *AuthHandler) signup(c *gin.Context) {
	var req dto.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}

	token, user, err := h.auth.SignUp(c.Request.Context(), req.Name, req.Email, req.Username, req.Password)
	if err != nil {
		if err == services.ErrConflict {
			utils.JSONError(c, http.StatusConflict, apierrors.ErrConflict, "account already exists", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusCreated, dto.AuthResponse{Token: token, User: toUserResponse(user)})
}

func (h *AuthHandler) login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	identifier := strings.TrimSpace(req.Identifier)
	if identifier == "" || strings.TrimSpace(req.Password) == "" {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "identifier and password are required", nil)
		return
	}

	token, user, err := h.auth.Login(c.Request.Context(), identifier, req.Password)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "invalid credentials", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, dto.AuthResponse{Token: token, User: toUserResponse(user)})
}

func (h *AuthHandler) me(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "missing token", nil)
		return
	}

	user, err := h.auth.Validate(c.Request.Context(), token)
	if err != nil {
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "invalid token", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, toUserResponse(user))
}

func (h *AuthHandler) logout(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "missing token", nil)
		return
	}

	if err := h.auth.Logout(c.Request.Context(), token); err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, gin.H{"ok": true})
}

func (h *AuthHandler) forgotPassword(c *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	lang := strings.TrimSpace(req.Lang)
	if err := h.auth.RequestPasswordReset(c.Request.Context(), req.Email, lang); err != nil {
		// Always return 200 to avoid user enumeration.
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"ok": true})
}

func (h *AuthHandler) resetPassword(c *gin.Context) {
	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	if err := h.auth.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"ok": true})
}

func (h *AuthHandler) oauthStart(c *gin.Context) {
	provider := strings.TrimSpace(c.Param("provider"))
	next := sanitizeReturnTo(c.Query("next"), "/")
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
	payload := utils.OAuthStatePayload{
		Intent:    "login",
		Provider:  provider,
		Next:      next,
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
		scopes := []string{"openid", "email", "profile"}
		url = google.BuildAuthURL(h.cfg.GoogleClientID, h.cfg.GoogleRedirectURL, state, scopes, false)
	case "github":
		if h.cfg.GitHubClientID == "" || h.cfg.GitHubClientSecret == "" || h.cfg.GitHubRedirectURL == "" {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "github oauth not configured", nil)
			return
		}
		scopes := []string{"read:user", "user:email"}
		url = github.BuildAuthURL(h.cfg.GitHubClientID, h.cfg.GitHubRedirectURL, state, scopes)
	default:
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "unsupported provider", nil)
		return
	}
	c.Redirect(http.StatusFound, url)
}

func (h *AuthHandler) oauthCallback(c *gin.Context) {
	provider := strings.TrimSpace(c.Param("provider"))
	code := strings.TrimSpace(c.Query("code"))
	state := strings.TrimSpace(c.Query("state"))
	if code == "" || state == "" {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "missing code or state", nil)
		return
	}
	stateSecret := []byte(h.cfg.OAuthStateSecret)
	if len(stateSecret) == 0 {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "oauth state secret not configured", nil)
		return
	}
	payload, err := utils.DecodeOAuthState(stateSecret, state, 10*time.Minute)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	if payload.Intent == "credential" {
		h.handleCredentialOAuthCallback(c, provider, code, payload)
		return
	}
	h.handleLoginOAuthCallback(c, provider, code, payload)
}

func (h *AuthHandler) handleLoginOAuthCallback(c *gin.Context, provider string, code string, payload utils.OAuthStatePayload) {
	switch provider {
	case "google":
		token, err := google.ExchangeCode(c.Request.Context(), h.cfg.GoogleClientID, h.cfg.GoogleClientSecret, h.cfg.GoogleRedirectURL, code)
		if err != nil {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
		profile, err := google.FetchUserProfile(c.Request.Context(), token.AccessToken)
		if err != nil {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
		user, err := h.findOrCreateOAuthUser(c, "google", profile.ID, profile.Email, profile.Name, profile.Email)
		if err != nil {
			utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
			return
		}
		_ = h.upsertOAuthAccount(c, "google", profile.ID, user.ID, token.AccessToken, token.RefreshToken, token.Scope, token.ExpiresIn)
		h.redirectWithSession(c, user, payload.Next)
	case "github":
		token, err := github.ExchangeCode(c.Request.Context(), h.cfg.GitHubClientID, h.cfg.GitHubClientSecret, h.cfg.GitHubRedirectURL, code)
		if err != nil {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
		profile, err := github.FetchUserProfile(c.Request.Context(), token.AccessToken)
		if err != nil {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
		if profile.Email == "" {
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "github email not available", nil)
			return
		}
		user, err := h.findOrCreateOAuthUser(c, "github", fmt.Sprintf("%d", profile.ID), profile.Email, profile.Name, profile.Login)
		if err != nil {
			utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
			return
		}
		_ = h.upsertOAuthAccount(c, "github", fmt.Sprintf("%d", profile.ID), user.ID, token.AccessToken, "", token.Scope, 0)
		h.redirectWithSession(c, user, payload.Next)
	default:
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "unsupported provider", nil)
	}
}

func (h *AuthHandler) handleCredentialOAuthCallback(c *gin.Context, provider string, code string, payload utils.OAuthStatePayload) {
	if h.creds == nil {
		h.redirectWithError(c, payload.ReturnTo, "credential service not configured")
		return
	}
	userID := strings.TrimSpace(payload.UserID)
	if userID == "" {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "missing user context", nil)
		return
	}
	user, err := h.users.Get(c.Request.Context(), userID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, "invalid user", nil)
		return
	}
	scope := payload.Scope
	projectID := payload.ProjectID
	credName := strings.TrimSpace(payload.Name)

	switch provider {
	case "google":
		token, err := google.ExchangeCode(c.Request.Context(), h.cfg.GoogleClientID, h.cfg.GoogleClientSecret, h.cfg.GoogleRedirectURL, code)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		profile, err := google.FetchUserProfile(c.Request.Context(), token.AccessToken)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		if token.RefreshToken == "" {
			h.redirectWithError(c, payload.ReturnTo, "missing refresh token from Google")
			return
		}
		if credName == "" {
			credName = "Google: " + profile.Email
		}
		data := map[string]any{
			"refresh_token": token.RefreshToken,
			"scopes":        token.Scope,
			"account_email": profile.Email,
		}
		enc, err := h.creds.EncryptPayload(data)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		cred := domain.Credential{
			ID:            utils.NewUUID(),
			Provider:      "google",
			Name:          credName,
			ProjectID:     projectID,
			DataEncrypted: enc,
		}
		created, err := h.creds.Create(c.Request.Context(), domain.AuthUser{ID: user.ID}, scope, projectID, cred)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		h.redirectWithCredential(c, payload.ReturnTo, created.ID, provider)
	case "github":
		token, err := github.ExchangeCode(c.Request.Context(), h.cfg.GitHubClientID, h.cfg.GitHubClientSecret, h.cfg.GitHubRedirectURL, code)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		profile, err := github.FetchUserProfile(c.Request.Context(), token.AccessToken)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		if credName == "" {
			credName = "GitHub: " + profile.Login
		}
		data := map[string]any{
			"access_token":  token.AccessToken,
			"scopes":        token.Scope,
			"account_login": profile.Login,
		}
		enc, err := h.creds.EncryptPayload(data)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		cred := domain.Credential{
			ID:            utils.NewUUID(),
			Provider:      "github",
			Name:          credName,
			ProjectID:     projectID,
			DataEncrypted: enc,
		}
		created, err := h.creds.Create(c.Request.Context(), domain.AuthUser{ID: user.ID}, scope, projectID, cred)
		if err != nil {
			h.redirectWithError(c, payload.ReturnTo, err.Error())
			return
		}
		h.redirectWithCredential(c, payload.ReturnTo, created.ID, provider)
	default:
		h.redirectWithError(c, payload.ReturnTo, "unsupported provider")
	}
}

func (h *AuthHandler) upsertOAuthAccount(ctx *gin.Context, provider string, providerUserID string, userID string, accessToken string, refreshToken string, scopes string, expiresIn int) error {
	encAccess := accessToken
	encRefresh := refreshToken
	if h.creds != nil {
		if accessToken != "" {
			if enc, err := h.creds.EncryptPayload(map[string]string{"token": accessToken}); err == nil {
				encAccess = enc
			}
		}
		if refreshToken != "" {
			if enc, err := h.creds.EncryptPayload(map[string]string{"token": refreshToken}); err == nil {
				encRefresh = enc
			}
		}
	}
	var expiry *time.Time
	if expiresIn > 0 {
		t := time.Now().UTC().Add(time.Duration(expiresIn) * time.Second)
		expiry = &t
	}
	acc := domain.OAuthAccount{
		ID:             utils.NewUUID(),
		UserID:         userID,
		Provider:       provider,
		ProviderUserID: providerUserID,
		AccessToken:    encAccess,
		RefreshToken:   encRefresh,
		TokenExpiry:    expiry,
		Scopes:         scopes,
	}
	return h.oauthAccounts.Upsert(ctx, acc)
}

func (h *AuthHandler) findOrCreateOAuthUser(ctx *gin.Context, provider string, providerUserID string, email string, name string, username string) (*domain.User, error) {
	if providerUserID != "" {
		if existing, err := h.oauthAccounts.GetByProviderUserID(ctx, provider, providerUserID); err == nil {
			return h.users.Get(ctx, existing.UserID)
		}
	}
	if email != "" {
		if existing, err := h.users.GetByEmail(ctx, email); err == nil {
			return existing, nil
		}
	}
	baseUsername := strings.TrimSpace(username)
	if baseUsername == "" && email != "" {
		parts := strings.Split(strings.ToLower(email), "@")
		baseUsername = parts[0]
	}
	if baseUsername == "" {
		baseUsername = "user"
	}
	if name == "" {
		name = baseUsername
	}
	for i := 0; i < 4; i++ {
		candidate := baseUsername
		if i > 0 {
			suffix, _ := utils.GenerateToken(3)
			candidate = baseUsername + "_" + suffix
		}
		user := domain.User{
			ID:       utils.NewUUID(),
			Name:     name,
			Email:    email,
			Username: candidate,
		}
		if err := h.users.Create(ctx, user); err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				continue
			}
			return nil, err
		}
		return &user, nil
	}
	return nil, errors.New("unable to create user")
}

func (h *AuthHandler) redirectWithSession(c *gin.Context, user *domain.User, next string) {
	token, err := h.auth.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	target := strings.TrimRight(h.cfg.AppBaseURL, "/") + "/auth/callback?token=" + token
	if next != "" {
		target += "&next=" + url.QueryEscape(next)
	}
	c.Redirect(http.StatusFound, target)
}

func (h *AuthHandler) redirectWithCredential(c *gin.Context, returnTo string, credentialID string, provider string) {
	path := sanitizeReturnTo(returnTo, "/")
	path = appendQuery(path, "connected", provider)
	if credentialID != "" {
		path = appendQuery(path, "credentialId", credentialID)
	}
	c.Redirect(http.StatusFound, strings.TrimRight(h.cfg.AppBaseURL, "/")+path)
}

func (h *AuthHandler) redirectWithError(c *gin.Context, returnTo string, message string) {
	path := sanitizeReturnTo(returnTo, "/")
	path = appendQuery(path, "error", message)
	c.Redirect(http.StatusFound, strings.TrimRight(h.cfg.AppBaseURL, "/")+path)
}

func appendQuery(path string, key string, value string) string {
	if strings.Contains(path, "?") {
		return path + "&" + url.QueryEscape(key) + "=" + url.QueryEscape(value)
	}
	return path + "?" + url.QueryEscape(key) + "=" + url.QueryEscape(value)
}
