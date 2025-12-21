package services

import (
	"context"
	"errors"
	"strings"
	"time"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type ProjectService struct {
	projects *repositories.ProjectRepository
	members  *repositories.ProjectMemberRepository
	users    *repositories.UserRepository
	flows    *repositories.FlowRepository
}

func NewProjectService(
	projects *repositories.ProjectRepository,
	members *repositories.ProjectMemberRepository,
	users *repositories.UserRepository,
	flows *repositories.FlowRepository,
) *ProjectService {
	return &ProjectService{projects: projects, members: members, users: users, flows: flows}
}

func normalizeRole(role string) string {
	role = strings.TrimSpace(strings.ToLower(role))
	if role == "" {
		return "member"
	}
	if role != "admin" && role != "member" {
		return "member"
	}
	return role
}

func (s *ProjectService) List(ctx context.Context, user AuthUser) ([]entities.Project, error) {
	return s.projects.ListByUser(ctx, user.ID)
}

func (s *ProjectService) Get(ctx context.Context, user AuthUser, projectID string) (*entities.Project, error) {
	return s.projects.GetForUser(ctx, projectID, user.ID)
}

func (s *ProjectService) Create(ctx context.Context, user AuthUser, name string, description string) (entities.Project, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return entities.Project{}, errors.New("project name is required")
	}
	description = strings.TrimSpace(description)

	p := entities.Project{
		ID:          utils.NewUUID(),
		Name:        name,
		Description: description,
		CreatedBy:   user.ID,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
		Role:        "admin",
	}
	if err := s.projects.Create(ctx, p); err != nil {
		return entities.Project{}, err
	}
	if err := s.members.Upsert(ctx, p.ID, user.ID, "admin"); err != nil {
		_ = s.projects.Delete(ctx, p.ID)
		return entities.Project{}, err
	}
	return p, nil
}

func (s *ProjectService) requireAdmin(ctx context.Context, projectID string, user AuthUser) error {
	role, err := s.members.GetRole(ctx, projectID, user.ID)
	if err == utils.ErrNotFound {
		return utils.ErrForbidden
	}
	if err != nil {
		return err
	}
	if strings.ToLower(strings.TrimSpace(role)) != "admin" {
		return utils.ErrForbidden
	}
	return nil
}

func (s *ProjectService) Update(ctx context.Context, user AuthUser, project entities.Project) error {
	if err := s.requireAdmin(ctx, project.ID, user); err != nil {
		return err
	}
	project.Name = strings.TrimSpace(project.Name)
	if project.Name == "" {
		return errors.New("project name is required")
	}
	project.Description = strings.TrimSpace(project.Description)
	return s.projects.Update(ctx, project)
}

func (s *ProjectService) Delete(ctx context.Context, user AuthUser, projectID string) error {
	if err := s.requireAdmin(ctx, projectID, user); err != nil {
		return err
	}
	if s.flows != nil {
		if err := s.flows.DeleteByProject(ctx, projectID); err != nil {
			return err
		}
	}
	return s.projects.Delete(ctx, projectID)
}

func (s *ProjectService) ListMembers(ctx context.Context, user AuthUser, projectID string) ([]entities.ProjectMember, error) {
	if _, err := s.members.GetRole(ctx, projectID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			return nil, utils.ErrForbidden
		}
		return nil, err
	}
	return s.members.ListMembers(ctx, projectID)
}

func (s *ProjectService) AddMember(ctx context.Context, user AuthUser, projectID string, identifier string, role string) error {
	if err := s.requireAdmin(ctx, projectID, user); err != nil {
		return err
	}
	identifier = strings.TrimSpace(identifier)
	if identifier == "" {
		return errors.New("identifier is required")
	}
	u, err := s.users.GetByEmailOrUsername(ctx, identifier)
	if err != nil {
		return err
	}
	return s.members.Upsert(ctx, projectID, u.ID, normalizeRole(role))
}

func (s *ProjectService) RemoveMember(ctx context.Context, user AuthUser, projectID string, userID string) error {
	if err := s.requireAdmin(ctx, projectID, user); err != nil {
		return err
	}
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return errors.New("userId is required")
	}
	return s.members.Remove(ctx, projectID, userID)
}

