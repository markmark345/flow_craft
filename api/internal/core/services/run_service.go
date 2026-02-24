package services

import (
	"context"
	"errors"
	"strings"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports"
	"flowcraft-api/internal/utils"
)

type RunService struct {
	runs           ports.RunRepository
	projectMembers ports.ProjectMemberRepository
}

func NewRunService(runs ports.RunRepository, projectMembers ports.ProjectMemberRepository) *RunService {
	return &RunService{runs: runs, projectMembers: projectMembers}
}

func (s *RunService) Create(ctx context.Context, run domain.Run) (domain.Run, error) {
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

func (s *RunService) List(ctx context.Context) ([]domain.Run, error) {
	return s.runs.List(ctx)
}

func (s *RunService) ListForUser(ctx context.Context, userID string) ([]domain.Run, error) {
	return s.runs.ListForUser(ctx, userID)
}

func (s *RunService) ListScopedForUser(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Run, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		return s.runs.ListByOwner(ctx, user.ID)
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
	return s.runs.ListByProject(ctx, projectID)
}

func (s *RunService) Get(ctx context.Context, id string) (*domain.Run, error) {
	return s.runs.Get(ctx, id)
}

func (s *RunService) GetForUser(ctx context.Context, id string, userID string) (*domain.Run, error) {
	return s.runs.GetForUser(ctx, id, userID)
}

func (s *RunService) UpdateStatus(ctx context.Context, id string, status string, log string) error {
	return s.runs.UpdateStatus(ctx, id, status, log)
}

func (s *RunService) GetStats(ctx context.Context, userID string) (*domain.RunStats, error) {
	return s.runs.GetStats(ctx, userID)
}

func (s *RunService) GetDailyStats(ctx context.Context, days int) ([]domain.DailyStat, error) {
	return s.runs.GetDailyStats(ctx, days)
}
