package httpadapter

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/adapters/database/postgres"
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/mailer"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
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

	flowRepo := postgres.NewFlowRepository(db)
	runRepo := postgres.NewRunRepository(db)
	runStepRepo := postgres.NewRunStepRepository(db)
	systemRepo := postgres.NewSystemRepository(db)
	userRepo := postgres.NewUserRepository(db)
	sessionRepo := postgres.NewAuthSessionRepository(db)
	passwordResetRepo := postgres.NewPasswordResetRepository(db)
	oauthAccountRepo := postgres.NewOAuthAccountRepository(db)
	credentialRepo := postgres.NewCredentialRepository(db)
	variableRepo := postgres.NewVariableRepository(db)
	projectRepo := postgres.NewProjectRepository(db)
	projectMemberRepo := postgres.NewProjectMemberRepository(db)

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
	nodeTestHandler := NewNodeTestHandler(credSvc, cfg)

	authHandler.Register(apiPublic)

	apiProtected := r.Group("/api/v1")
	apiProtected.Use(func(c *gin.Context) {
		raw := strings.TrimSpace(c.GetHeader("Authorization"))
		parts := strings.SplitN(raw, " ", 2)
		if len(parts) != 2 || strings.ToLower(strings.TrimSpace(parts[0])) != "bearer" {
			utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "missing token", nil)
			c.Abort()
			return
		}

		token := strings.TrimSpace(parts[1])
		if token == "" {
			utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "missing token", nil)
			c.Abort()
			return
		}

		user, err := authSvc.Validate(c, token)
		if err != nil {
			if err == utils.ErrNotFound {
				utils.JSONError(c, http.StatusUnauthorized, apierrors.ErrUnauthorized, "invalid token", nil)
				c.Abort()
				return
			}
			utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
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
	nodeTestHandler.Register(apiProtected)
	apiProtected.POST("/flows/:id/run", runHandler.CreateForFlow)
	apiProtected.POST("/workflows/:id/run", runHandler.CreateForFlow)

	return r
}
