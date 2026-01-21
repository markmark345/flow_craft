package mocks

import (
	"context"
	"flowcraft-api/internal/core/domain"
	"time"
)

// MockUserRepository implements ports.UserRepository
type MockUserRepository struct {
	CreateFunc               func(ctx context.Context, user domain.User) error
	GetByEmailOrUsernameFunc func(ctx context.Context, identifier string) (*domain.User, error)
	GetByEmailFunc           func(ctx context.Context, email string) (*domain.User, error)
	GetFunc                  func(ctx context.Context, id string) (*domain.User, error)
	UpdatePasswordFunc       func(ctx context.Context, userID string, passwordHash string) error
}

func (m *MockUserRepository) Create(ctx context.Context, user domain.User) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, user)
	}
	return nil
}

func (m *MockUserRepository) GetByEmailOrUsername(ctx context.Context, identifier string) (*domain.User, error) {
	if m.GetByEmailOrUsernameFunc != nil {
		return m.GetByEmailOrUsernameFunc(ctx, identifier)
	}
	return nil, nil
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if m.GetByEmailFunc != nil {
		return m.GetByEmailFunc(ctx, email)
	}
	return nil, nil
}

func (m *MockUserRepository) Get(ctx context.Context, id string) (*domain.User, error) {
	if m.GetFunc != nil {
		return m.GetFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockUserRepository) UpdatePassword(ctx context.Context, userID string, passwordHash string) error {
	if m.UpdatePasswordFunc != nil {
		return m.UpdatePasswordFunc(ctx, userID, passwordHash)
	}
	return nil
}

// MockAuthSessionRepository implements ports.AuthSessionRepository
type MockAuthSessionRepository struct {
	CreateFunc         func(ctx context.Context, token string, userID string) error
	DeleteFunc         func(ctx context.Context, token string) error
	GetUserByTokenFunc func(ctx context.Context, token string) (*domain.User, error)
}

func (m *MockAuthSessionRepository) Create(ctx context.Context, token string, userID string) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, token, userID)
	}
	return nil
}

func (m *MockAuthSessionRepository) Delete(ctx context.Context, token string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, token)
	}
	return nil
}

func (m *MockAuthSessionRepository) GetUserByToken(ctx context.Context, token string) (*domain.User, error) {
	if m.GetUserByTokenFunc != nil {
		return m.GetUserByTokenFunc(ctx, token)
	}
	return nil, nil
}

// MockPasswordResetRepository implements ports.PasswordResetRepository
type MockPasswordResetRepository struct {
	CreateFunc         func(ctx context.Context, reset domain.PasswordReset) error
	GetByTokenHashFunc func(ctx context.Context, tokenHash string) (*domain.PasswordReset, error)
	MarkUsedFunc       func(ctx context.Context, id string) error
	DeleteExpiredFunc  func(ctx context.Context, before time.Time) error
}

func (m *MockPasswordResetRepository) Create(ctx context.Context, reset domain.PasswordReset) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, reset)
	}
	return nil
}

func (m *MockPasswordResetRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*domain.PasswordReset, error) {
	if m.GetByTokenHashFunc != nil {
		return m.GetByTokenHashFunc(ctx, tokenHash)
	}
	return nil, nil
}

func (m *MockPasswordResetRepository) MarkUsed(ctx context.Context, id string) error {
	if m.MarkUsedFunc != nil {
		return m.MarkUsedFunc(ctx, id)
	}
	return nil
}

func (m *MockPasswordResetRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	if m.DeleteExpiredFunc != nil {
		return m.DeleteExpiredFunc(ctx, before)
	}
	return nil
}

// MockRunRepository implements ports.RunRepository
type MockRunRepository struct {
	CreateFunc        func(ctx context.Context, run domain.Run) error
	ListFunc          func(ctx context.Context) ([]domain.Run, error)
	ListForUserFunc   func(ctx context.Context, userID string) ([]domain.Run, error)
	ListByOwnerFunc   func(ctx context.Context, userID string) ([]domain.Run, error)
	ListByProjectFunc func(ctx context.Context, projectID string) ([]domain.Run, error)
	GetFunc           func(ctx context.Context, id string) (*domain.Run, error)
	GetForUserFunc    func(ctx context.Context, id string, userID string) (*domain.Run, error)
	GetStatsFunc      func(ctx context.Context, userID string) (*domain.RunStats, error)
	UpdateStatusFunc  func(ctx context.Context, id string, status string, log string) error
}

func (m *MockRunRepository) Create(ctx context.Context, run domain.Run) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, run)
	}
	return nil
}

func (m *MockRunRepository) List(ctx context.Context) ([]domain.Run, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx)
	}
	return nil, nil
}

func (m *MockRunRepository) ListForUser(ctx context.Context, userID string) ([]domain.Run, error) {
	if m.ListForUserFunc != nil {
		return m.ListForUserFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRunRepository) ListByOwner(ctx context.Context, userID string) ([]domain.Run, error) {
	if m.ListByOwnerFunc != nil {
		return m.ListByOwnerFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRunRepository) ListByProject(ctx context.Context, projectID string) ([]domain.Run, error) {
	if m.ListByProjectFunc != nil {
		return m.ListByProjectFunc(ctx, projectID)
	}
	return nil, nil
}

func (m *MockRunRepository) Get(ctx context.Context, id string) (*domain.Run, error) {
	if m.GetFunc != nil {
		return m.GetFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockRunRepository) GetForUser(ctx context.Context, id string, userID string) (*domain.Run, error) {
	if m.GetForUserFunc != nil {
		return m.GetForUserFunc(ctx, id, userID)
	}
	return nil, nil
}

func (m *MockRunRepository) GetStats(ctx context.Context, userID string) (*domain.RunStats, error) {
	if m.GetStatsFunc != nil {
		return m.GetStatsFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRunRepository) UpdateStatus(ctx context.Context, id string, status string, log string) error {
	if m.UpdateStatusFunc != nil {
		return m.UpdateStatusFunc(ctx, id, status, log)
	}
	return nil
}

// MockFlowRepository implements ports.FlowRepository
type MockFlowRepository struct {
	CreateFunc          func(ctx context.Context, flow domain.Flow) error
	ListFunc            func(ctx context.Context) ([]domain.Flow, error)
	ListByOwnerFunc     func(ctx context.Context, userID string) ([]domain.Flow, error)
	ListByProjectFunc   func(ctx context.Context, projectID string) ([]domain.Flow, error)
	GetFunc             func(ctx context.Context, id string) (*domain.Flow, error)
	UpdateFunc          func(ctx context.Context, flow domain.Flow) error
	DeleteFunc          func(ctx context.Context, id string) error
	DeleteByProjectFunc func(ctx context.Context, projectID string) error
}

func (m *MockFlowRepository) Create(ctx context.Context, flow domain.Flow) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, flow)
	}
	return nil
}

func (m *MockFlowRepository) List(ctx context.Context) ([]domain.Flow, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx)
	}
	return nil, nil
}

func (m *MockFlowRepository) ListByOwner(ctx context.Context, userID string) ([]domain.Flow, error) {
	if m.ListByOwnerFunc != nil {
		return m.ListByOwnerFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockFlowRepository) ListByProject(ctx context.Context, projectID string) ([]domain.Flow, error) {
	if m.ListByProjectFunc != nil {
		return m.ListByProjectFunc(ctx, projectID)
	}
	return nil, nil
}

func (m *MockFlowRepository) Get(ctx context.Context, id string) (*domain.Flow, error) {
	if m.GetFunc != nil {
		return m.GetFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockFlowRepository) Update(ctx context.Context, flow domain.Flow) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, flow)
	}
	return nil
}

func (m *MockFlowRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, id)
	}
	return nil
}

func (m *MockFlowRepository) DeleteByProject(ctx context.Context, projectID string) error {
	if m.DeleteByProjectFunc != nil {
		return m.DeleteByProjectFunc(ctx, projectID)
	}
	return nil
}

// MockProjectMemberRepository implements ports.ProjectMemberRepository
type MockProjectMemberRepository struct {
	UpsertFunc      func(ctx context.Context, projectID string, userID string, role string) error
	RemoveFunc      func(ctx context.Context, projectID string, userID string) error
	GetRoleFunc     func(ctx context.Context, projectID string, userID string) (string, error)
	ListMembersFunc func(ctx context.Context, projectID string) ([]domain.ProjectMember, error)
}

func (m *MockProjectMemberRepository) Upsert(ctx context.Context, projectID string, userID string, role string) error {
	if m.UpsertFunc != nil {
		return m.UpsertFunc(ctx, projectID, userID, role)
	}
	return nil
}

func (m *MockProjectMemberRepository) Remove(ctx context.Context, projectID string, userID string) error {
	if m.RemoveFunc != nil {
		return m.RemoveFunc(ctx, projectID, userID)
	}
	return nil
}

func (m *MockProjectMemberRepository) GetRole(ctx context.Context, projectID string, userID string) (string, error) {
	if m.GetRoleFunc != nil {
		return m.GetRoleFunc(ctx, projectID, userID)
	}
	return "", nil
}

func (m *MockProjectMemberRepository) ListMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error) {
	if m.ListMembersFunc != nil {
		return m.ListMembersFunc(ctx, projectID)
	}
	return nil, nil
}
