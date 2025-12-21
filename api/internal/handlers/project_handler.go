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

type ProjectHandler struct {
	projects *services.ProjectService
}

func NewProjectHandler(projects *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{projects: projects}
}

func (h *ProjectHandler) Register(r *gin.RouterGroup) {
	r.GET("/projects", h.list)
	r.POST("/projects", h.create)
	r.GET("/projects/:id", h.get)
	r.PUT("/projects/:id", h.update)
	r.DELETE("/projects/:id", h.delete)
	r.GET("/projects/:id/members", h.listMembers)
	r.POST("/projects/:id/members", h.addMember)
	r.DELETE("/projects/:id/members/:userId", h.removeMember)
}

func projectRefResponse(project *entities.Project) *dto.ProjectRef {
	if project == nil {
		return nil
	}
	return &dto.ProjectRef{ID: project.ID, Name: project.Name}
}

func projectToResponse(project entities.Project) dto.ProjectResponse {
	var createdAt string
	if !project.CreatedAt.IsZero() {
		createdAt = project.CreatedAt.UTC().Format(time.RFC3339)
	}
	var updatedAt string
	if !project.UpdatedAt.IsZero() {
		updatedAt = project.UpdatedAt.UTC().Format(time.RFC3339)
	}
	return dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		Role:        project.Role,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}

func (h *ProjectHandler) list(c *gin.Context) {
	user, _ := currentAuthUser(c)
	projects, err := h.projects.List(c, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	out := make([]dto.ProjectResponse, 0, len(projects))
	for _, p := range projects {
		out = append(out, projectToResponse(p))
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *ProjectHandler) create(c *gin.Context) {
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	created, err := h.projects.Create(c, user, req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: projectToResponse(created)})
}

func (h *ProjectHandler) get(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	project, err := h.projects.Get(c, user, id)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "project not found"}})
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
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: projectToResponse(*project)})
}

func (h *ProjectHandler) update(c *gin.Context) {
	id := c.Param("id")
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	project := entities.Project{ID: id, Name: strings.TrimSpace(req.Name), Description: strings.TrimSpace(req.Description)}
	if err := h.projects.Update(c, user, project); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "project not found"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	updated, _ := h.projects.Get(c, user, id)
	if updated == nil {
		c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: dto.ProjectResponse{ID: id}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: projectToResponse(*updated)})
}

func (h *ProjectHandler) delete(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	if err := h.projects.Delete(c, user, id); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "project not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"id": id}})
}

func (h *ProjectHandler) listMembers(c *gin.Context) {
	projectID := c.Param("id")
	user, _ := currentAuthUser(c)
	members, err := h.projects.ListMembers(c, user, projectID)
	if err == utils.ErrForbidden {
		c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	out := make([]dto.ProjectMemberResponse, 0, len(members))
	for _, m := range members {
		if m.User == nil {
			continue
		}
		out = append(out, dto.ProjectMemberResponse{
			User: dto.UserResponse{ID: m.User.ID, Name: m.User.Name, Email: m.User.Email},
			Role: m.Role,
		})
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *ProjectHandler) addMember(c *gin.Context) {
	projectID := c.Param("id")
	var req dto.ProjectMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	user, _ := currentAuthUser(c)
	if err := h.projects.AddMember(c, user, projectID, req.Identifier, req.Role); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "user or project not found"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, dto.ResponseEnvelope{Data: gin.H{"ok": true}})
}

func (h *ProjectHandler) removeMember(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.Param("userId")
	user, _ := currentAuthUser(c)
	if err := h.projects.RemoveMember(c, user, projectID, userID); err != nil {
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "project not found"}})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "bad_request", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: gin.H{"ok": true}})
}

