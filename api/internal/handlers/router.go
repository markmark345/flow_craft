package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/mailer"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/services"
	"flowcraft-api/internal/utils"
)

func NewRouter(cfg config.Config, db *sql.DB, logger zerolog.Logger, temporalClient client.Client) *gin.Engine {
	r := gin.Default()

	// Simple CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		originsCfg := strings.TrimSpace(cfg.CORSOrigins)
		allow := originsCfg == "" || originsCfg == "*"
		if !allow && origin != "" {
			for _, o := range strings.Split(originsCfg, ",") {
				if strings.TrimSpace(o) == origin {
					allow = true
					break
				}
			}
		}
		if allow {
			if origin == "" {
				origin = "*"
			}
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if strings.ToUpper(c.Request.Method) == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.Use(func(c *gin.Context) {
		c.Set("logger", logger)
		c.Next()
	})

	apiPublic := r.Group("/api/v1")
	apiPublic.GET("/health", HealthHandler)

	flowRepo := repositories.NewFlowRepository(db)
	runRepo := repositories.NewRunRepository(db)
	runStepRepo := repositories.NewRunStepRepository(db)
	systemRepo := repositories.NewSystemRepository(db)
	userRepo := repositories.NewUserRepository(db)
	sessionRepo := repositories.NewAuthSessionRepository(db)
	passwordResetRepo := repositories.NewPasswordResetRepository(db)
	oauthAccountRepo := repositories.NewOAuthAccountRepository(db)
	credentialRepo := repositories.NewCredentialRepository(db)
	variableRepo := repositories.NewVariableRepository(db)
	projectRepo := repositories.NewProjectRepository(db)
	projectMemberRepo := repositories.NewProjectMemberRepository(db)

	flowSvc := services.NewFlowService(flowRepo, projectMemberRepo)
	runSvc := services.NewRunService(runRepo, projectMemberRepo)
	runStepSvc := services.NewRunStepService(runStepRepo)
	systemSvc := services.NewSystemService(systemRepo)
	projectSvc := services.NewProjectService(projectRepo, projectMemberRepo, userRepo, flowRepo)
	variableSvc := services.NewVariableService(variableRepo, projectMemberRepo)

	credSvc, err := services.NewCredentialService(credentialRepo, projectMemberRepo, cfg.CredentialsEncKey)
	if err != nil {
		logger.Error().Err(err).Msg("invalid credentials encryption key")
		credSvc = nil
	}

	parseBool := func(value string) bool {
		parsed, err := strconv.ParseBool(strings.TrimSpace(value))
		return err == nil && parsed
	}
	mail := (*mailer.Mailer)(nil)
	if strings.TrimSpace(cfg.SMTPHost) != "" && strings.TrimSpace(cfg.SMTPFrom) != "" {
		port, err := strconv.Atoi(strings.TrimSpace(cfg.SMTPPort))
		if err != nil || port == 0 {
			port = 587
		}
		cfgMailer := mailer.Config{
			Host:        cfg.SMTPHost,
			Port:        port,
			Username:    cfg.SMTPUser,
			Password:    cfg.SMTPPass,
			From:        cfg.SMTPFrom,
			UseTLS:      parseBool(cfg.SMTPUseTLS),
			UseStartTLS: parseBool(cfg.SMTPUseStartTLS),
			AppBaseURL:  cfg.AppBaseURL,
			SupportURL:  cfg.SMTPSupportURL,
		}
		instance, err := mailer.New(cfgMailer)
		if err != nil {
			logger.Error().Err(err).Msg("failed to initialize mailer")
		} else {
			mail = instance
		}
	}

	authSvc := services.NewAuthService(userRepo, sessionRepo, passwordResetRepo, mail, cfg.AppBaseURL)

	flowHandler := NewFlowHandler(flowSvc)
	runHandler := NewRunHandler(runSvc, flowSvc, runStepSvc, temporalClient)
	systemHandler := NewSystemHandler(systemSvc)
	authHandler := NewAuthHandler(authSvc, userRepo, oauthAccountRepo, credSvc, cfg)
	projectHandler := NewProjectHandler(projectSvc)
	variableHandler := NewVariableHandler(variableSvc)
	var credentialHandler *CredentialHandler
	if credSvc != nil {
		credentialHandler = NewCredentialHandler(credSvc, cfg)
	}

	authHandler.Register(apiPublic)

	apiProtected := r.Group("/api/v1")
	apiProtected.Use(func(c *gin.Context) {
		raw := strings.TrimSpace(c.GetHeader("Authorization"))
		parts := strings.SplitN(raw, " ", 2)
		if len(parts) != 2 || strings.ToLower(strings.TrimSpace(parts[0])) != "bearer" {
			c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "missing token"}})
			c.Abort()
			return
		}

		token := strings.TrimSpace(parts[1])
		if token == "" {
			c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "missing token"}})
			c.Abort()
			return
		}

		user, err := authSvc.Validate(c, token)
		if err != nil {
			if err == utils.ErrNotFound {
				c.JSON(http.StatusUnauthorized, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "unauthorized", Message: "invalid token"}})
				c.Abort()
				return
			}
			c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
			c.Abort()
			return
		}

		c.Set("authUser", user)
		c.Next()
	})

	flowHandler.Register(apiProtected)
	runHandler.Register(apiProtected)
	systemHandler.Register(apiProtected)
	projectHandler.Register(apiProtected)
	if credentialHandler != nil {
		credentialHandler.Register(apiProtected)
	}
	variableHandler.Register(apiProtected)
	apiProtected.POST("/flows/:id/run", runHandler.CreateForFlow)
	apiProtected.POST("/workflows/:id/run", runHandler.CreateForFlow)

	return r
}
