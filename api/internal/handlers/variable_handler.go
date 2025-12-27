package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/services"
	"flowcraft-api/internal/utils"
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

	items, err := h.vars.ListScoped(c, user, scope, projectID)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}

	out := make([]dto.VariableResponse, 0, len(items))
	for _, item := range items {
		out = append(out, variableToResponse(item))
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *VariableHandler) create(c *gin.Context) {
	user, _ := currentAuthUser(c)
	var req dto.VariableCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	variable := entities.Variable{
		Key:   strings.TrimSpace(req.Key),
		Value: req.Value,
	}
	created, err := h.vars.Create(c, user, req.Scope, req.ProjectID, variable)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: variableToResponse(created)})
}

func (h *VariableHandler) update(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	var req dto.VariableUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	if req.Key != nil {
		trimmed := strings.TrimSpace(*req.Key)
		req.Key = &trimmed
	}
	updated, err := h.vars.Update(c, user, id, req.Key, req.Value)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "variable not found"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	if updated == nil {
		c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: variableToResponse(*updated)})
}

func (h *VariableHandler) delete(c *gin.Context) {
	user, _ := currentAuthUser(c)
	id := c.Param("id")
	if err := h.vars.Delete(c, user, id); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "variable not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
}

func variableToResponse(variable entities.Variable) dto.VariableResponse {
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
