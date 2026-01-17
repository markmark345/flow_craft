package services

import (
	"context"

	"flowcraft-api/internal/core/ports"
)

type SystemService struct {
	system ports.SystemRepository
}

func NewSystemService(system ports.SystemRepository) *SystemService {
	return &SystemService{system: system}
}

func (s *SystemService) ResetWorkspace(ctx context.Context) error {
	return s.system.ResetWorkspace(ctx)
}

