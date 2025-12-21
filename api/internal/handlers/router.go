package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/services"
	"flowcraft-api/internal/utils"
	"github.com/rs/zerolog"
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

	flowSvc := services.NewFlowService(flowRepo)
	runSvc := services.NewRunService(runRepo)
	runStepSvc := services.NewRunStepService(runStepRepo)
	systemSvc := services.NewSystemService(systemRepo)
	authSvc := services.NewAuthService(userRepo, sessionRepo)

	flowHandler := NewFlowHandler(flowSvc)
	runHandler := NewRunHandler(runSvc, flowSvc, runStepSvc, temporalClient)
	systemHandler := NewSystemHandler(systemSvc)
	authHandler := NewAuthHandler(authSvc)

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
	apiProtected.POST("/flows/:id/run", runHandler.CreateForFlow)

	return r
}
