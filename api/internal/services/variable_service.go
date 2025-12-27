package services

import (
	"context"
	"errors"
	"strings"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type VariableService struct {
	vars           *repositories.VariableRepository
	projectMembers *repositories.ProjectMemberRepository
}

func NewVariableService(vars *repositories.VariableRepository, projectMembers *repositories.ProjectMemberRepository) *VariableService {
	return &VariableService{vars: vars, projectMembers: projectMembers}
}

func (s *VariableService) ListScoped(ctx context.Context, user AuthUser, scope string, projectID string) ([]entities.Variable, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		return s.vars.ListForUser(ctx, user.ID)
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

func (s *VariableService) Create(ctx context.Context, user AuthUser, scope string, projectID string, variable entities.Variable) (entities.Variable, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		variable.UserID = user.ID
		variable.ProjectID = ""
	} else if scope == "project" {
		if strings.TrimSpace(projectID) == "" {
			return entities.Variable{}, errors.New("projectId is required for project scope")
		}
		if s.projectMembers == nil {
			return entities.Variable{}, utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, projectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return entities.Variable{}, utils.ErrForbidden
			}
			return entities.Variable{}, err
		}
		if role != "admin" {
			return entities.Variable{}, utils.ErrForbidden
		}
		variable.ProjectID = projectID
		variable.UserID = user.ID
	} else {
		return entities.Variable{}, errors.New("invalid scope")
	}

	if variable.ID == "" {
		variable.ID = utils.NewUUID()
	}
	if strings.TrimSpace(variable.Key) == "" {
		return entities.Variable{}, errors.New("key is required")
	}

	if err := s.vars.Create(ctx, variable); err != nil {
		return entities.Variable{}, err
	}
	return variable, nil
}

func (s *VariableService) Get(ctx context.Context, user AuthUser, id string) (*entities.Variable, error) {
	variable, err := s.vars.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if variable.ProjectID == "" {
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

func (s *VariableService) Update(ctx context.Context, user AuthUser, id string, key *string, value *string) (*entities.Variable, error) {
	existing, err := s.vars.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing.ProjectID == "" {
		if existing.UserID != user.ID {
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

func (s *VariableService) Delete(ctx context.Context, user AuthUser, id string) error {
	variable, err := s.vars.Get(ctx, id)
	if err != nil {
		return err
	}
	if variable.ProjectID == "" {
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
