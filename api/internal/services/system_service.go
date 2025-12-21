package services

import (
	"context"

	"flowcraft-api/internal/repositories"
)

type SystemService struct {
	system *repositories.SystemRepository
}

func NewSystemService(system *repositories.SystemRepository) *SystemService {
	return &SystemService{system: system}
}

func (s *SystemService) ResetWorkspace(ctx context.Context) error {
	return s.system.ResetWorkspace(ctx)
}

