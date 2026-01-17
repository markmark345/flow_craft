package httpadapter

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
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
	if err := h.system.ResetWorkspace(c.Request.Context()); err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"ok": true})
}
