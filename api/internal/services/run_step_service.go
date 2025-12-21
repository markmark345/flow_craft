package services

import (
	"context"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
)

type RunStepService struct {
	steps *repositories.RunStepRepository
}

func NewRunStepService(steps *repositories.RunStepRepository) *RunStepService {
	return &RunStepService{steps: steps}
}

func (s *RunStepService) ListByRunID(ctx context.Context, runID string) ([]entities.RunStep, error) {
	return s.steps.ListByRunID(ctx, runID)
}

func (s *RunStepService) Get(ctx context.Context, runID string, stepIDOrKey string) (*entities.RunStep, error) {
	return s.steps.Get(ctx, runID, stepIDOrKey)
}

func (s *RunStepService) CancelOpenSteps(ctx context.Context, runID string, message string) error {
	return s.steps.CancelOpenSteps(ctx, runID, message)
}
