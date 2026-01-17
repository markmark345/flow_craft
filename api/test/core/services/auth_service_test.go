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
	"golang.org/x/crypto/bcrypt"
)

func TestAuthService_SignUp(t *testing.T) {
	tests := []struct {
		name          string
		inputName     string
		inputEmail    string
		inputUsername string
		inputPassword string
		mockUser      func(*mocks.MockUserRepository)
		mockSession   func(*mocks.MockAuthSessionRepository)
		wantToken     bool
		wantErr       error
	}{
		{
			name:          "successful signup",
			inputName:     "Test User",
			inputEmail:    "test@example.com",
			inputUsername: "testuser",
			inputPassword: "password123",
			mockUser: func(m *mocks.MockUserRepository) {
				m.CreateFunc = func(ctx context.Context, user domain.User) error {
					assert.Equal(t, "test@example.com", user.Email)
					assert.NotEmpty(t, user.ID)
					assert.NotEmpty(t, user.PasswordHash)
					return nil
				}
			},
			mockSession: func(m *mocks.MockAuthSessionRepository) {
				m.CreateFunc = func(ctx context.Context, token, userID string) error {
					assert.NotEmpty(t, token)
					assert.NotEmpty(t, userID)
					return nil
				}
			},
			wantToken: true,
			wantErr:   nil,
		},
		{
			name:          "invalid email",
			inputEmail:    "invalid-email",
			inputPassword: "password123",
			wantErr:       errors.New("valid email is required"),
		},
		{
			name:          "missing password",
			inputEmail:    "test@example.com",
			inputPassword: "",
			wantErr:       errors.New("password is required"),
		},
		{
			name:          "repo error fails signup",
			inputEmail:    "test@example.com",
			inputPassword: "password123",
			mockUser: func(m *mocks.MockUserRepository) {
				m.CreateFunc = func(ctx context.Context, user domain.User) error {
					return errors.New("db error")
				}
			},
			wantErr: errors.New("db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mUser := &mocks.MockUserRepository{}
			mSession := &mocks.MockAuthSessionRepository{}

			if tt.mockUser != nil {
				tt.mockUser(mUser)
			}
			if tt.mockSession != nil {
				tt.mockSession(mSession)
			}

			// Pass nil for PasswordResetRepository and Mailer as they are not used in SignUp
			svc := services.NewAuthService(mUser, mSession, nil, nil, "http://localhost:3000")

			token, user, err := svc.SignUp(context.Background(), tt.inputName, tt.inputEmail, tt.inputUsername, tt.inputPassword)

			if tt.wantErr != nil {
				assert.EqualError(t, err, tt.wantErr.Error())
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				if tt.wantToken {
					assert.NotEmpty(t, token)
					assert.Equal(t, tt.inputEmail, user.Email)
				}
			}
		})
	}
}

func TestAuthService_Login(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	validUser := &domain.User{
		ID:           "user-1",
		Email:        "test@example.com",
		Username:     "testuser",
		PasswordHash: string(hashedPassword),
	}

	tests := []struct {
		name        string
		identifier  string
		password    string
		mockUser    func(*mocks.MockUserRepository)
		mockSession func(*mocks.MockAuthSessionRepository)
		wantToken   bool
		wantErr     error
	}{
		{
			name:       "successful login",
			identifier: "test@example.com",
			password:   "password123",
			mockUser: func(m *mocks.MockUserRepository) {
				m.GetByEmailOrUsernameFunc = func(ctx context.Context, id string) (*domain.User, error) {
					return validUser, nil
				}
			},
			mockSession: func(m *mocks.MockAuthSessionRepository) {
				m.CreateFunc = func(ctx context.Context, token, userID string) error {
					assert.Equal(t, "user-1", userID)
					return nil
				}
			},
			wantToken: true,
			wantErr:   nil,
		},
		{
			name:       "user not found",
			identifier: "unknown@example.com",
			password:   "password123",
			mockUser: func(m *mocks.MockUserRepository) {
				m.GetByEmailOrUsernameFunc = func(ctx context.Context, id string) (*domain.User, error) {
					return nil, utils.ErrNotFound
				}
			},
			wantErr: services.ErrInvalidCredentials,
		},
		{
			name:       "wrong password",
			identifier: "test@example.com",
			password:   "wrongpassword",
			mockUser: func(m *mocks.MockUserRepository) {
				m.GetByEmailOrUsernameFunc = func(ctx context.Context, id string) (*domain.User, error) {
					return validUser, nil
				}
			},
			wantErr: services.ErrInvalidCredentials,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mUser := &mocks.MockUserRepository{}
			mSession := &mocks.MockAuthSessionRepository{}

			if tt.mockUser != nil {
				tt.mockUser(mUser)
			}
			if tt.mockSession != nil {
				tt.mockSession(mSession)
			}

			svc := services.NewAuthService(mUser, mSession, nil, nil, "http://localhost:3000")

			token, user, err := svc.Login(context.Background(), tt.identifier, tt.password)

			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				if tt.wantToken {
					assert.NotEmpty(t, token)
					assert.Equal(t, validUser.ID, user.ID)
				}
			}
		})
	}
}
