package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/services"
)

type SystemHandler struct {
	system *services.SystemService
}

func NewSystemHandler(system *services.SystemService) *SystemHandler {
	return &SystemHandler{system: system}
}

func (h *SystemHandler) Register(r *gin.RouterGroup) {
	r.POST("/system/reset", h.reset)
}

func (h *SystemHandler) reset(c *gin.Context) {
	if err := h.system.ResetWorkspace(c); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"ok": true}})
}

