package services

import (
	"context"
	"errors"
	"strings"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports"
	"flowcraft-api/internal/utils"
)

type VariableService struct {
	vars           ports.VariableRepository
	projectMembers ports.ProjectMemberRepository
}

func NewVariableService(vars ports.VariableRepository, projectMembers ports.ProjectMemberRepository) *VariableService {
	return &VariableService{vars: vars, projectMembers: projectMembers}
}

func (s *VariableService) ListScoped(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Variable, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		return s.vars.ListForUser(ctx, user.ID)
	}
	if scope == "global" {
		return s.vars.ListGlobal(ctx)
	}
	if scope != "project" {
		return nil, errors.New("invalid scope")
	}
	if strings.TrimSpace(projectID) == "" {
		return nil, errors.New("projectId is required for project scope")
	}
	if s.projectMembers == nil {
		return nil, utils.ErrForbidden
	}
	if _, err := s.projectMembers.GetRole(ctx, projectID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			return nil, utils.ErrForbidden
		}
		return nil, err
	}
	return s.vars.ListForProject(ctx, projectID)
}

func (s *VariableService) Create(ctx context.Context, user domain.AuthUser, scope string, projectID string, variable domain.Variable) (domain.Variable, error) {
	scope = strings.TrimSpace(scope)
	switch scope {
	case "", "personal":
		variable.UserID = user.ID
		variable.ProjectID = ""
	case "global":
		variable.UserID = ""
		variable.ProjectID = ""
	case "project":
		if strings.TrimSpace(projectID) == "" {
			return domain.Variable{}, errors.New("projectId is required for project scope")
		}
		if s.projectMembers == nil {
			return domain.Variable{}, utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, projectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return domain.Variable{}, utils.ErrForbidden
			}
			return domain.Variable{}, err
		}
		if role != "admin" {
			return domain.Variable{}, utils.ErrForbidden
		}
		variable.ProjectID = projectID
		variable.UserID = user.ID
	default:
		return domain.Variable{}, errors.New("invalid scope")
	}

	if variable.ID == "" {
		variable.ID = utils.NewUUID()
	}
	if strings.TrimSpace(variable.Key) == "" {
		return domain.Variable{}, errors.New("key is required")
	}

	if err := s.vars.Create(ctx, variable); err != nil {
		return domain.Variable{}, err
	}
	return variable, nil
}

func (s *VariableService) Get(ctx context.Context, user domain.AuthUser, id string) (*domain.Variable, error) {
	variable, err := s.vars.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if variable.ProjectID == "" {
		// Personal or Global
		if variable.UserID == "" {
			// Global: allow all (for now)
			return variable, nil
		}
		if variable.UserID != user.ID {
			return nil, utils.ErrForbidden
		}
		return variable, nil
	}
	if s.projectMembers == nil {
		return nil, utils.ErrForbidden
	}
	if _, err := s.projectMembers.GetRole(ctx, variable.ProjectID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			return nil, utils.ErrForbidden
		}
		return nil, err
	}
	return variable, nil
}

func (s *VariableService) Update(ctx context.Context, user domain.AuthUser, id string, key *string, value *string) (*domain.Variable, error) {
	existing, err := s.vars.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing.ProjectID == "" {
		if existing.UserID == "" {
			// Global: allow update
		} else if existing.UserID != user.ID {
			return nil, utils.ErrForbidden
		}
	} else {
		if s.projectMembers == nil {
			return nil, utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, existing.ProjectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return nil, utils.ErrForbidden
			}
			return nil, err
		}
		if role != "admin" {
			return nil, utils.ErrForbidden
		}
	}
	variable := *existing
	if key != nil {
		variable.Key = strings.TrimSpace(*key)
	}
	if value != nil {
		variable.Value = *value
	}
	if strings.TrimSpace(variable.Key) == "" {
		return nil, errors.New("key is required")
	}
	if err := s.vars.Update(ctx, variable); err != nil {
		return nil, err
	}
	return &variable, nil
}

func (s *VariableService) Delete(ctx context.Context, user domain.AuthUser, id string) error {
	variable, err := s.vars.Get(ctx, id)
	if err != nil {
		return err
	}
	if variable.ProjectID == "" {
		if variable.UserID == "" {
			// Global: allow delete (should restrict to admin/creator?)
			// For now allow all
			return s.vars.Delete(ctx, id)
		}
		if variable.UserID != user.ID {
			return utils.ErrForbidden
		}
	} else {
		if s.projectMembers == nil {
			return utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, variable.ProjectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return utils.ErrForbidden
			}
			return err
		}
		if role != "admin" {
			return utils.ErrForbidden
		}
	}
	return s.vars.Delete(ctx, id)
}
