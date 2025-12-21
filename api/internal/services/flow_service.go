package services

import (
	"context"
	"errors"
	"strings"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type FlowService struct {
	flows          *repositories.FlowRepository
	projectMembers *repositories.ProjectMemberRepository
}

func NewFlowService(flows *repositories.FlowRepository, projectMembers *repositories.ProjectMemberRepository) *FlowService {
	return &FlowService{flows: flows, projectMembers: projectMembers}
}

func (s *FlowService) Create(ctx context.Context, flow entities.Flow) (entities.Flow, error) {
	if flow.ID == "" {
		flow.ID = utils.NewUUID()
	}
	if strings.TrimSpace(flow.Scope) == "" {
		flow.Scope = "personal"
	}
	if flow.Scope == "personal" && strings.TrimSpace(flow.OwnerUserID) == "" && strings.TrimSpace(flow.CreatedBy) != "" {
		flow.OwnerUserID = flow.CreatedBy
	}
	if flow.Status == "" {
		flow.Status = "draft"
	}
	if flow.Version == 0 {
		flow.Version = 1
	}
	if flow.DefinitionJSON == "" {
		flow.DefinitionJSON = "{}"
	}
	return flow, s.flows.Create(ctx, flow)
}

func (s *FlowService) CreateAccessible(ctx context.Context, user AuthUser, flow entities.Flow) (entities.Flow, error) {
	scope := strings.TrimSpace(flow.Scope)
	if scope == "" {
		scope = "personal"
	}
	flow.Scope = scope

	flow.CreatedBy = user.ID
	flow.UpdatedBy = user.ID

	switch scope {
	case "personal":
		flow.OwnerUserID = user.ID
		flow.ProjectID = ""
	case "project":
		if strings.TrimSpace(flow.ProjectID) == "" {
			return entities.Flow{}, errors.New("projectId is required for project scope")
		}
		flow.OwnerUserID = ""
		if s.projectMembers == nil {
			return entities.Flow{}, utils.ErrForbidden
		}
		if _, err := s.projectMembers.GetRole(ctx, flow.ProjectID, user.ID); err != nil {
			if err == utils.ErrNotFound {
				return entities.Flow{}, utils.ErrForbidden
			}
			return entities.Flow{}, err
		}
	default:
		return entities.Flow{}, errors.New("invalid scope")
	}

	return s.Create(ctx, flow)
}

func (s *FlowService) ListScoped(ctx context.Context, user AuthUser, scope string, projectID string) ([]entities.Flow, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		return s.flows.ListByOwner(ctx, user.ID)
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
	return s.flows.ListByProject(ctx, projectID)
}

func (s *FlowService) GetAccessible(ctx context.Context, user AuthUser, id string) (*entities.Flow, error) {
	flow, err := s.flows.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	scope := strings.TrimSpace(flow.Scope)
	if scope == "" {
		scope = "personal"
	}
	switch scope {
	case "personal":
		ownerID := strings.TrimSpace(flow.OwnerUserID)
		if ownerID == "" {
			ownerID = strings.TrimSpace(flow.CreatedBy)
		}
		if ownerID == "" || ownerID != user.ID {
			return nil, utils.ErrForbidden
		}
		return flow, nil
	case "project":
		projectID := strings.TrimSpace(flow.ProjectID)
		if projectID == "" {
			return nil, utils.ErrNotFound
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
		return flow, nil
	default:
		return nil, utils.ErrNotFound
	}
}

func (s *FlowService) UpdateAccessible(ctx context.Context, user AuthUser, flow entities.Flow) error {
	if _, err := s.GetAccessible(ctx, user, flow.ID); err != nil {
		return err
	}
	return s.flows.Update(ctx, flow)
}

func (s *FlowService) DeleteAccessible(ctx context.Context, user AuthUser, id string) error {
	if _, err := s.GetAccessible(ctx, user, id); err != nil {
		return err
	}
	return s.flows.Delete(ctx, id)
}
