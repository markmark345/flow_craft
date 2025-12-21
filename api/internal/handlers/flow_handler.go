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

type FlowHandler struct {
	flows *services.FlowService
}

func NewFlowHandler(flows *services.FlowService) *FlowHandler {
	return &FlowHandler{flows: flows}
}

func currentAuthUser(c *gin.Context) (services.AuthUser, bool) {
	v, ok := c.Get("authUser")
	if !ok {
		return services.AuthUser{}, false
	}
	u, ok := v.(services.AuthUser)
	return u, ok
}

func ownerResponse(owner *entities.UserRef) *dto.UserResponse {
	if owner == nil {
		return nil
	}
	return &dto.UserResponse{ID: owner.ID, Name: owner.Name, Email: owner.Email}
}

func projectResponse(project *entities.ProjectRef) *dto.ProjectRef {
	if project == nil {
		return nil
	}
	return &dto.ProjectRef{ID: project.ID, Name: project.Name}
}

func (h *FlowHandler) Register(r *gin.RouterGroup) {
	r.POST("/flows", h.create)
	r.GET("/flows", h.list)
	r.GET("/flows/:id", h.get)
	r.PUT("/flows/:id", h.update)
	r.DELETE("/flows/:id", h.delete)

	// Alias for n8n-style "workflows"
	r.POST("/workflows", h.create)
	r.GET("/workflows", h.list)
	r.GET("/workflows/:id", h.get)
	r.PUT("/workflows/:id", h.update)
	r.DELETE("/workflows/:id", h.delete)
}

func (h *FlowHandler) create(c *gin.Context) {
	var req dto.FlowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	flow := entities.Flow{
		Name:           req.Name,
		Description:    req.Description,
		Scope:          req.Scope,
		ProjectID:      req.ProjectID,
		Status:         req.Status,
		Version:        req.Version,
		DefinitionJSON: req.DefinitionJSON,
	}

	created, err := h.flows.CreateAccessible(c, user, flow)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	full, err := h.flows.GetAccessible(c, user, created.ID)
	if err != nil {
		full = &created
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             full.ID,
		Name:           full.Name,
		Description:    full.Description,
		Scope:          full.Scope,
		ProjectID:      full.ProjectID,
		Project:        projectResponse(full.Project),
		Status:         full.Status,
		Version:        full.Version,
		DefinitionJSON: full.DefinitionJSON,
		UpdatedAt:      time.Now().UTC().Format(time.RFC3339),
		Owner:          ownerResponse(full.Owner),
	}})
}

func (h *FlowHandler) list(c *gin.Context) {
	scope := strings.TrimSpace(c.Query("scope"))
	projectID := strings.TrimSpace(c.Query("projectId"))
	user, _ := currentAuthUser(c)

	flows, err := h.flows.ListScoped(c, user, scope, projectID)
	if err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	out := make([]dto.FlowResponse, 0, len(flows))
	for _, f := range flows {
		out = append(out, dto.FlowResponse{
			ID:             f.ID,
			Name:           f.Name,
			Description:    f.Description,
			Scope:          f.Scope,
			ProjectID:      f.ProjectID,
			Project:        projectResponse(f.Project),
			Status:         f.Status,
			Version:        f.Version,
			DefinitionJSON: f.DefinitionJSON,
			UpdatedAt:      f.UpdatedAt.UTC().Format(time.RFC3339),
			Owner:          ownerResponse(f.Owner),
		})
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *FlowHandler) get(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	flow, err := h.flows.GetAccessible(c, user, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
		return
	}
	if err == utils.ErrForbidden {
		c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             flow.ID,
		Name:           flow.Name,
		Description:    flow.Description,
		Scope:          flow.Scope,
		ProjectID:      flow.ProjectID,
		Project:        projectResponse(flow.Project),
		Status:         flow.Status,
		Version:        flow.Version,
		DefinitionJSON: flow.DefinitionJSON,
		UpdatedAt:      flow.UpdatedAt.UTC().Format(time.RFC3339),
		Owner:          ownerResponse(flow.Owner),
	}})
}

func (h *FlowHandler) update(c *gin.Context) {
	id := c.Param("id")
	var req dto.FlowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	existing, err := h.flows.GetAccessible(c, user, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
		return
	}
	if err == utils.ErrForbidden {
		c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.Status != "" {
		existing.Status = req.Status
	}
	if req.Version != 0 {
		existing.Version = req.Version
	}
	if req.DefinitionJSON != "" {
		existing.DefinitionJSON = req.DefinitionJSON
	}

	existing.UpdatedBy = user.ID

	if err := h.flows.UpdateAccessible(c, user, *existing); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
			return
		}
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             existing.ID,
		Name:           existing.Name,
		Description:    existing.Description,
		Scope:          existing.Scope,
		ProjectID:      existing.ProjectID,
		Project:        projectResponse(existing.Project),
		Status:         existing.Status,
		Version:        existing.Version,
		DefinitionJSON: existing.DefinitionJSON,
		UpdatedAt:      time.Now().UTC().Format(time.RFC3339),
		Owner:          ownerResponse(existing.Owner),
	}})
}

func (h *FlowHandler) delete(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	if err := h.flows.DeleteAccessible(c, user, id); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
			return
		}
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
}
