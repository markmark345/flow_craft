package services_test

import (
	"context"
	"errors"
	"testing"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports/mocks"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/utils"

	"github.com/stretchr/testify/assert"
)

func TestFlowService_Create(t *testing.T) {
	tests := []struct {
		name      string
		input     domain.Flow
		mockSetup func(*mocks.MockFlowRepository)
		wantErr   error
		verify    func(*testing.T, domain.Flow)
	}{
		{
			name:  "creates flow with defaults",
			input: domain.Flow{Name: "Test Flow", CreatedBy: "user-1"},
			mockSetup: func(m *mocks.MockFlowRepository) {
				m.CreateFunc = func(ctx context.Context, flow domain.Flow) error {
					return nil
				}
			},
			wantErr: nil,
			verify: func(t *testing.T, result domain.Flow) {
				assert.NotEmpty(t, result.ID)
				assert.Equal(t, "draft", result.Status)
				assert.Equal(t, "personal", result.Scope)
				assert.Equal(t, 1, result.Version)
				assert.Equal(t, "{}", result.DefinitionJSON)
				assert.Equal(t, "user-1", result.OwnerUserID)
			},
		},
		{
			name:  "repo error propagates",
			input: domain.Flow{Name: "Test Flow"},
			mockSetup: func(m *mocks.MockFlowRepository) {
				m.CreateFunc = func(ctx context.Context, flow domain.Flow) error {
					return errors.New("db error")
				}
			},
			wantErr: errors.New("db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFlowRef := &mocks.MockFlowRepository{}
			if tt.mockSetup != nil {
				tt.mockSetup(mockFlowRef)
			}
			svc := services.NewFlowService(mockFlowRef, nil)

			got, err := svc.Create(context.Background(), tt.input)
			if tt.wantErr != nil {
				assert.EqualError(t, err, tt.wantErr.Error())
			} else {
				assert.NoError(t, err)
			}
			if tt.verify != nil {
				tt.verify(t, got)
			}
		})
	}
}

func TestFlowService_CreateAccessible(t *testing.T) {
	tests := []struct {
		name            string
		user            domain.AuthUser
		input           domain.Flow
		mockFlowSetup   func(*mocks.MockFlowRepository)
		mockMemberSetup func(*mocks.MockProjectMemberRepository)
		wantErr         error
	}{
		{
			name:  "personal scope sets owner",
			user:  domain.AuthUser{ID: "user-1"},
			input: domain.Flow{Name: "My Flow", Scope: "personal"},
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.CreateFunc = func(ctx context.Context, flow domain.Flow) error {
					assert.Equal(t, "user-1", flow.OwnerUserID)
					assert.Empty(t, flow.ProjectID)
					return nil
				}
			},
			wantErr: nil,
		},
		{
			name:    "project scope requires projectId",
			user:    domain.AuthUser{ID: "user-1"},
			input:   domain.Flow{Name: "Project Flow", Scope: "project"},
			wantErr: errors.New("projectId is required for project scope"),
		},
		{
			name:  "project scope checks membership",
			user:  domain.AuthUser{ID: "user-1"},
			input: domain.Flow{Name: "Project Flow", Scope: "project", ProjectID: "proj-1"},
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					assert.Equal(t, "proj-1", pid)
					assert.Equal(t, "user-1", uid)
					return "editor", nil
				}
			},
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.CreateFunc = func(ctx context.Context, flow domain.Flow) error {
					assert.Equal(t, "proj-1", flow.ProjectID)
					assert.Empty(t, flow.OwnerUserID)
					return nil
				}
			},
			wantErr: nil,
		},
		{
			name:  "project scope forbidden if not member",
			user:  domain.AuthUser{ID: "user-1"},
			input: domain.Flow{Name: "Project Flow", Scope: "project", ProjectID: "proj-1"},
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "", utils.ErrNotFound
				}
			},
			wantErr: utils.ErrForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFlowRef := &mocks.MockFlowRepository{}
			mockMemberRef := &mocks.MockProjectMemberRepository{}

			if tt.mockFlowSetup != nil {
				tt.mockFlowSetup(mockFlowRef)
			}
			if tt.mockMemberSetup != nil {
				tt.mockMemberSetup(mockMemberRef)
			}

			svc := services.NewFlowService(mockFlowRef, mockMemberRef)

			_, err := svc.CreateAccessible(context.Background(), tt.user, tt.input)
			if tt.wantErr != nil {
				if tt.wantErr == utils.ErrForbidden {
					assert.Equal(t, utils.ErrForbidden, err)
				} else {
					assert.EqualError(t, err, tt.wantErr.Error())
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFlowService_ListScoped(t *testing.T) {
	tests := []struct {
		name            string
		user            domain.AuthUser
		scope           string
		projectID       string
		mockFlowSetup   func(*mocks.MockFlowRepository)
		mockMemberSetup func(*mocks.MockProjectMemberRepository)
		wantErr         error
	}{
		{
			name:  "list personal flows",
			user:  domain.AuthUser{ID: "user-1"},
			scope: "personal",
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.ListByOwnerFunc = func(ctx context.Context, uid string) ([]domain.Flow, error) {
					assert.Equal(t, "user-1", uid)
					return []domain.Flow{}, nil
				}
			},
			wantErr: nil,
		},
		{
			name:      "list project flows requires membership",
			user:      domain.AuthUser{ID: "user-1"},
			scope:     "project",
			projectID: "proj-1",
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "viewer", nil
				}
			},
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.ListByProjectFunc = func(ctx context.Context, pid string) ([]domain.Flow, error) {
					assert.Equal(t, "proj-1", pid)
					return []domain.Flow{}, nil
				}
			},
			wantErr: nil,
		},
		{
			name:      "list project flows forbidden",
			user:      domain.AuthUser{ID: "user-1"},
			scope:     "project",
			projectID: "proj-1",
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "", utils.ErrNotFound
				}
			},
			wantErr: utils.ErrForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mFlow := &mocks.MockFlowRepository{}
			mMember := &mocks.MockProjectMemberRepository{}
			if tt.mockFlowSetup != nil {
				tt.mockFlowSetup(mFlow)
			}
			if tt.mockMemberSetup != nil {
				tt.mockMemberSetup(mMember)
			}
			svc := services.NewFlowService(mFlow, mMember)
			_, err := svc.ListScoped(context.Background(), tt.user, tt.scope, tt.projectID)
			if tt.wantErr != nil {
				if tt.wantErr == utils.ErrForbidden {
					assert.Equal(t, utils.ErrForbidden, err)
				} else {
					assert.EqualError(t, err, tt.wantErr.Error())
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFlowService_GetAccessible(t *testing.T) {
	tests := []struct {
		name            string
		user            domain.AuthUser
		flowID          string
		mockFlowSetup   func(*mocks.MockFlowRepository)
		mockMemberSetup func(*mocks.MockProjectMemberRepository)
		wantErr         error
	}{
		{
			name:   "get personal flow success",
			user:   domain.AuthUser{ID: "user-1"},
			flowID: "flow-1",
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
					return &domain.Flow{ID: "flow-1", Scope: "personal", OwnerUserID: "user-1"}, nil
				}
			},
			wantErr: nil,
		},
		{
			name:   "get personal flow forbidden",
			user:   domain.AuthUser{ID: "user-2"},
			flowID: "flow-1",
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
					return &domain.Flow{ID: "flow-1", Scope: "personal", OwnerUserID: "user-1"}, nil
				}
			},
			wantErr: utils.ErrForbidden,
		},
		{
			name:   "get project flow success",
			user:   domain.AuthUser{ID: "user-1"},
			flowID: "flow-2",
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
					return &domain.Flow{ID: "flow-2", Scope: "project", ProjectID: "proj-1"}, nil
				}
			},
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "viewer", nil
				}
			},
			wantErr: nil,
		},
		{
			name:   "get project flow forbidden",
			user:   domain.AuthUser{ID: "user-1"},
			flowID: "flow-2",
			mockFlowSetup: func(m *mocks.MockFlowRepository) {
				m.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
					return &domain.Flow{ID: "flow-2", Scope: "project", ProjectID: "proj-1"}, nil
				}
			},
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "", utils.ErrNotFound
				}
			},
			wantErr: utils.ErrForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mFlow := &mocks.MockFlowRepository{}
			mMember := &mocks.MockProjectMemberRepository{}
			if tt.mockFlowSetup != nil {
				tt.mockFlowSetup(mFlow)
			}
			if tt.mockMemberSetup != nil {
				tt.mockMemberSetup(mMember)
			}
			svc := services.NewFlowService(mFlow, mMember)
			_, err := svc.GetAccessible(context.Background(), tt.user, tt.flowID)
			if tt.wantErr != nil {
				if tt.wantErr == utils.ErrForbidden {
					assert.Equal(t, utils.ErrForbidden, err)
				} else {
					assert.EqualError(t, err, tt.wantErr.Error())
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFlowService_UpdateAccessible(t *testing.T) {
	// Reuses GetAccessible logic, so verifying it calls Update after check is enough
	user := domain.AuthUser{ID: "user-1"}
	flow := domain.Flow{ID: "flow-1", Scope: "personal", OwnerUserID: "user-1", Name: "Updated"}

	mFlow := &mocks.MockFlowRepository{}
	mFlow.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
		return &domain.Flow{ID: "flow-1", Scope: "personal", OwnerUserID: "user-1"}, nil
	}
	mFlow.UpdateFunc = func(ctx context.Context, f domain.Flow) error {
		assert.Equal(t, "Updated", f.Name)
		return nil
	}

	svc := services.NewFlowService(mFlow, nil)
	err := svc.UpdateAccessible(context.Background(), user, flow)
	assert.NoError(t, err)
}

func TestFlowService_DeleteAccessible(t *testing.T) {
	// Reuses GetAccessible logic
	user := domain.AuthUser{ID: "user-1"}

	mFlow := &mocks.MockFlowRepository{}
	mFlow.GetFunc = func(ctx context.Context, id string) (*domain.Flow, error) {
		return &domain.Flow{ID: "flow-1", Scope: "personal", OwnerUserID: "user-1"}, nil
	}
	mFlow.DeleteFunc = func(ctx context.Context, id string) error {
		assert.Equal(t, "flow-1", id)
		return nil
	}

	svc := services.NewFlowService(mFlow, nil)
	err := svc.DeleteAccessible(context.Background(), user, "flow-1")
	assert.NoError(t, err)
}
