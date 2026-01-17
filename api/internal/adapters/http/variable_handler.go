package httpadapter

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
)

type VariableHandler struct {
	vars *services.VariableService
}

func NewVariableHandler(vars *services.VariableService) *VariableHandler {
	return &VariableHandler{vars: vars}
}

func (h *VariableHandler) Register(r *gin.RouterGroup) {
	r.GET("/variables", h.list)
	r.POST("/variables", h.create)
	r.PUT("/variables/:id", h.update)
	r.DELETE("/variables/:id", h.delete)
}

func (h *VariableHandler) list(c *gin.Context) {
	user, _ := currentAuthUser(c)
	scope := strings.TrimSpace(c.Query("scope"))
	projectID := strings.TrimSpace(c.Query("projectId"))

	items, err := h.vars.ListScoped(c.Request.Context(), user, scope, projectID)
	if err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}

	out := make([]dto.VariableResponse, 0, len(items))
	for _, item := range items {
		out = append(out, variableToResponse(item))
	}
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *VariableHandler) create(c *gin.Context) {
	user, _ := currentAuthUser(c)
	var req dto.VariableCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	variable := domain.Variable{
		Key:   strings.TrimSpace(req.Key),
		Value: req.Value,
	}
	created, err := h.vars.Create(c.Request.Context(), user, req.Scope, req.ProjectID, variable)
	if err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, variableToResponse(created))
}

func (h *VariableHandler) update(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	var req dto.VariableUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	if req.Key != nil {
		trimmed := strings.TrimSpace(*req.Key)
		req.Key = &trimmed
	}
	updated, err := h.vars.Update(c.Request.Context(), user, id, req.Key, req.Value)
	if err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "variable not found", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	if updated == nil {
		utils.JSONResponse(c, http.StatusOK, gin.H{"id": id})
		return
	}
	utils.JSONResponse(c, http.StatusOK, variableToResponse(*updated))
}

func (h *VariableHandler) delete(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	if err := h.vars.Delete(c.Request.Context(), user, id); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "variable not found", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"id": id})
}

func variableToResponse(variable domain.Variable) dto.VariableResponse {
	scope := "personal"
	if variable.ProjectID != "" {
		scope = "project"
	}
	return dto.VariableResponse{
		ID:        variable.ID,
		Key:       variable.Key,
		Value:     variable.Value,
		Scope:     scope,
		ProjectID: variable.ProjectID,
		CreatedAt: variable.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: variable.UpdatedAt.UTC().Format(time.RFC3339),
	}
}
