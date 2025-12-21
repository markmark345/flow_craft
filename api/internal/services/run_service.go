package services

import (
    "context"

    "flowcraft-api/internal/entities"
    "flowcraft-api/internal/repositories"
    "flowcraft-api/internal/utils"
)

type RunService struct {
    runs *repositories.RunRepository
}

func NewRunService(runs *repositories.RunRepository) *RunService {
    return &RunService{runs: runs}
}

func (s *RunService) Create(ctx context.Context, run entities.Run) (entities.Run, error) {
    if run.ID == "" {
        run.ID = utils.NewUUID()
    }
    if run.Status == "" {
        run.Status = "queued"
    }
    if run.TemporalWorkflow == "" {
        run.TemporalWorkflow = "run-" + run.ID
    }
    return run, s.runs.Create(ctx, run)
}

func (s *RunService) List(ctx context.Context) ([]entities.Run, error) {
    return s.runs.List(ctx)
}

func (s *RunService) Get(ctx context.Context, id string) (*entities.Run, error) {
    return s.runs.Get(ctx, id)
}

func (s *RunService) UpdateStatus(ctx context.Context, id string, status string, log string) error {
    return s.runs.UpdateStatus(ctx, id, status, log)
}
