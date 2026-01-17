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

func TestRunService_Create(t *testing.T) {
	tests := []struct {
		name      string
		input     domain.Run
		mockSetup func(*mocks.MockRunRepository)
		verify    func(*testing.T, domain.Run)
		wantErr   error
	}{
		{
			name:  "creates run with defaults",
			input: domain.Run{FlowID: "flow-1"},
			mockSetup: func(m *mocks.MockRunRepository) {
				m.CreateFunc = func(ctx context.Context, run domain.Run) error {
					return nil
				}
			},
			verify: func(t *testing.T, r domain.Run) {
				assert.NotEmpty(t, r.ID)
				assert.Equal(t, "queued", r.Status)
				assert.Contains(t, r.TemporalWorkflow, "run-")
			},
			wantErr: nil,
		},
		{
			name:  "repo error propagates",
			input: domain.Run{FlowID: "flow-1"},
			mockSetup: func(m *mocks.MockRunRepository) {
				m.CreateFunc = func(ctx context.Context, run domain.Run) error {
					return errors.New("db error")
				}
			},
			wantErr: errors.New("db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mRuns := &mocks.MockRunRepository{}
			if tt.mockSetup != nil {
				tt.mockSetup(mRuns)
			}
			svc := services.NewRunService(mRuns, nil)
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

func TestRunService_ListScopedForUser(t *testing.T) {
	tests := []struct {
		name            string
		user            domain.AuthUser
		scope           string
		projectID       string
		mockRunSetup    func(*mocks.MockRunRepository)
		mockMemberSetup func(*mocks.MockProjectMemberRepository)
		wantErr         error
	}{
		{
			name:  "list personal runs",
			user:  domain.AuthUser{ID: "user-1"},
			scope: "personal",
			mockRunSetup: func(m *mocks.MockRunRepository) {
				m.ListByOwnerFunc = func(ctx context.Context, uid string) ([]domain.Run, error) {
					assert.Equal(t, "user-1", uid)
					return []domain.Run{}, nil
				}
			},
			wantErr: nil,
		},
		{
			name:      "list project runs success",
			user:      domain.AuthUser{ID: "user-1"},
			scope:     "project",
			projectID: "proj-1",
			mockMemberSetup: func(m *mocks.MockProjectMemberRepository) {
				m.GetRoleFunc = func(ctx context.Context, pid, uid string) (string, error) {
					return "viewer", nil
				}
			},
			mockRunSetup: func(m *mocks.MockRunRepository) {
				m.ListByProjectFunc = func(ctx context.Context, pid string) ([]domain.Run, error) {
					assert.Equal(t, "proj-1", pid)
					return []domain.Run{}, nil
				}
			},
			wantErr: nil,
		},
		{
			name:      "list project runs forbidden",
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
			mRuns := &mocks.MockRunRepository{}
			mMembers := &mocks.MockProjectMemberRepository{}
			if tt.mockRunSetup != nil {
				tt.mockRunSetup(mRuns)
			}
			if tt.mockMemberSetup != nil {
				tt.mockMemberSetup(mMembers)
			}
			svc := services.NewRunService(mRuns, mMembers)
			_, err := svc.ListScopedForUser(context.Background(), tt.user, tt.scope, tt.projectID)
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
