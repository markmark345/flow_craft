package services

import (
	"context"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports"
)

type RunStepService struct {
	steps ports.RunStepRepository
}

func NewRunStepService(steps ports.RunStepRepository) *RunStepService {
	return &RunStepService{steps: steps}
}

func (s *RunStepService) ListByRunID(ctx context.Context, runID string) ([]domain.RunStep, error) {
	return s.steps.ListByRunID(ctx, runID)
}

func (s *RunStepService) Get(ctx context.Context, runID string, stepIDOrKey string) (*domain.RunStep, error) {
	return s.steps.Get(ctx, runID, stepIDOrKey)
}

func (s *RunStepService) CancelOpenSteps(ctx context.Context, runID string, message string) error {
	return s.steps.CancelOpenSteps(ctx, runID, message)
}
