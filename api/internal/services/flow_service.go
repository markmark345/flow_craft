package services

import (
	"context"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type FlowService struct {
	flows *repositories.FlowRepository
}

func NewFlowService(flows *repositories.FlowRepository) *FlowService {
	return &FlowService{flows: flows}
}

func (s *FlowService) Create(ctx context.Context, flow entities.Flow) (entities.Flow, error) {
	if flow.ID == "" {
		flow.ID = utils.NewUUID()
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

func (s *FlowService) List(ctx context.Context) ([]entities.Flow, error) {
	return s.flows.List(ctx)
}

func (s *FlowService) Get(ctx context.Context, id string) (*entities.Flow, error) {
	return s.flows.Get(ctx, id)
}

func (s *FlowService) Update(ctx context.Context, flow entities.Flow) error {
	return s.flows.Update(ctx, flow)
}

func (s *FlowService) Delete(ctx context.Context, id string) error {
	return s.flows.Delete(ctx, id)
}
