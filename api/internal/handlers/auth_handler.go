package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/services"
	"flowcraft-api/internal/utils"
)

type AuthHandler struct {
	auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(r *gin.RouterGroup) {
	r.POST("/auth/signup", h.signup)
	r.POST("/auth/login", h.login)
	r.GET("/auth/me", h.me)
	r.POST("/auth/logout", h.logout)
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

func toUserResponse(u services.AuthUser) dto.UserResponse {
	return dto.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}
}

func (h *AuthHandler) signup(c *gin.Context) {
	var req dto.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}

	token, user, err := h.auth.SignUp(c, req.Name, req.Email, req.Username, req.Password)
	if err != nil {
		if err == services.ErrConflict {
			c.JSON(http.StatusConflict, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "conflict", Message: "account already exists"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: dto.AuthResponse{Token: token, User: toUserResponse(user)}})
}

func (h *AuthHandler) login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	identifier := strings.TrimSpace(req.Identifier)
	if identifier == "" || strings.TrimSpace(req.Password) == "" {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: "identifier and password are required"}})
		return
	}

	token, user, err := h.auth.Login(c, identifier, req.Password)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "invalid_credentials", Message: "invalid credentials"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.AuthResponse{Token: token, User: toUserResponse(user)}})
}

func (h *AuthHandler) me(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "missing token"}})
		return
	}

	user, err := h.auth.Validate(c, token)
	if err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "invalid token"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: toUserResponse(user)})
}

func (h *AuthHandler) logout(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "missing token"}})
		return
	}

	if err := h.auth.Logout(c, token); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"ok": true}})
}
