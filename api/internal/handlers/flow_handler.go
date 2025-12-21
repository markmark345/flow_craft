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

func (h *FlowHandler) Register(r *gin.RouterGroup) {
	r.POST("/flows", h.create)
	r.GET("/flows", h.list)
	r.GET("/flows/:id", h.get)
	r.PUT("/flows/:id", h.update)
	r.DELETE("/flows/:id", h.delete)
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
		Status:         req.Status,
		Version:        req.Version,
		DefinitionJSON: req.DefinitionJSON,
		CreatedBy:      user.ID,
		UpdatedBy:      user.ID,
	}
	created, err := h.flows.Create(c, flow)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	var owner *dto.UserResponse
	if strings.TrimSpace(user.ID) != "" {
		owner = &dto.UserResponse{ID: user.ID, Name: user.Name, Email: user.Email}
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             created.ID,
		Name:           created.Name,
		Status:         created.Status,
		Version:        created.Version,
		DefinitionJSON: created.DefinitionJSON,
		UpdatedAt:      time.Now().UTC().Format(time.RFC3339),
		Owner:          owner,
	}})
}

func (h *FlowHandler) list(c *gin.Context) {
	flows, err := h.flows.List(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	out := make([]dto.FlowResponse, 0, len(flows))
	for _, f := range flows {
		out = append(out, dto.FlowResponse{
			ID:             f.ID,
			Name:           f.Name,
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
	flow, err := h.flows.Get(c, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             flow.ID,
		Name:           flow.Name,
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
	existing, err := h.flows.Get(c, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	if req.Name != "" {
		existing.Name = req.Name
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

	if user, ok := currentAuthUser(c); ok {
		existing.UpdatedBy = user.ID
	}

	if err := h.flows.Update(c, *existing); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.FlowResponse{
		ID:             existing.ID,
		Name:           existing.Name,
		Status:         existing.Status,
		Version:        existing.Version,
		DefinitionJSON: existing.DefinitionJSON,
		UpdatedAt:      time.Now().UTC().Format(time.RFC3339),
		Owner:          ownerResponse(existing.Owner),
	}})
}

func (h *FlowHandler) delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.flows.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
}
