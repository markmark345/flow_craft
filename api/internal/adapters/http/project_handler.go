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

func projectToResponse(project domain.Project) dto.ProjectResponse {
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
	projects, err := h.projects.List(c.Request.Context(), user)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	out := make([]dto.ProjectResponse, 0, len(projects))
	for _, p := range projects {
		out = append(out, projectToResponse(p))
	}
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *ProjectHandler) create(c *gin.Context) {
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	user, _ := currentAuthUser(c)
	created, err := h.projects.Create(c.Request.Context(), user, req.Name, req.Description)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, projectToResponse(created))
}

func (h *ProjectHandler) get(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	project, err := h.projects.Get(c.Request.Context(), user, id)
	if err == utils.ErrNotFound {
		utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "project not found", nil)
		return
	}
	if err == utils.ErrForbidden {
		utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, projectToResponse(*project))
}

func (h *ProjectHandler) update(c *gin.Context) {
	id := c.Param("id")
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	user, _ := currentAuthUser(c)
	project := domain.Project{ID: id, Name: strings.TrimSpace(req.Name), Description: strings.TrimSpace(req.Description)}
	if err := h.projects.Update(c.Request.Context(), user, project); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "project not found", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	updated, _ := h.projects.Get(c.Request.Context(), user, id)
	if updated == nil {
		utils.JSONResponse(c, http.StatusOK, dto.ProjectResponse{ID: id})
		return
	}
	utils.JSONResponse(c, http.StatusOK, projectToResponse(*updated))
}

func (h *ProjectHandler) delete(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	if err := h.projects.Delete(c.Request.Context(), user, id); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "project not found", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"id": id})
}

func (h *ProjectHandler) listMembers(c *gin.Context) {
	projectID := c.Param("id")
	user, _ := currentAuthUser(c)
	members, err := h.projects.ListMembers(c.Request.Context(), user, projectID)
	if err == utils.ErrForbidden {
		utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
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
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *ProjectHandler) addMember(c *gin.Context) {
	projectID := c.Param("id")
	var req dto.ProjectMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	user, _ := currentAuthUser(c)
	if err := h.projects.AddMember(c.Request.Context(), user, projectID, req.Identifier, req.Role); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "user or project not found", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, gin.H{"ok": true})
}

func (h *ProjectHandler) removeMember(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.Param("userId")
	user, _ := currentAuthUser(c)
	if err := h.projects.RemoveMember(c.Request.Context(), user, projectID, userID); err != nil {
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "project not found", nil)
			return
		}
		utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, gin.H{"ok": true})
}
