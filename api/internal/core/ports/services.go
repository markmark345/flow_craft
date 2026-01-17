package ports

import (
	"context"

	"flowcraft-api/internal/core/domain"
)

type AuthService interface {
	SignUp(ctx context.Context, name string, email string, username string, password string) (string, domain.AuthUser, error)
	Login(ctx context.Context, identifier string, password string) (string, domain.AuthUser, error)
	Validate(ctx context.Context, token string) (domain.AuthUser, error)
	Logout(ctx context.Context, token string) error
	CreateSession(ctx context.Context, userID string) (string, error)
	RequestPasswordReset(ctx context.Context, email string, lang string) error
	ResetPassword(ctx context.Context, rawToken string, newPassword string) error
}

type CredentialService interface {
	EncryptPayload(payload any) (string, error)
	DecryptPayload(encrypted string, out any) error
	ListScoped(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Credential, error)
	Create(ctx context.Context, user domain.AuthUser, scope string, projectID string, cred domain.Credential) (domain.Credential, error)
	Get(ctx context.Context, user domain.AuthUser, id string) (*domain.Credential, error)
	Update(ctx context.Context, user domain.AuthUser, cred domain.Credential) error
	Delete(ctx context.Context, user domain.AuthUser, id string) error
}

type FlowService interface {
	Create(ctx context.Context, flow domain.Flow) (domain.Flow, error)
	CreateAccessible(ctx context.Context, user domain.AuthUser, flow domain.Flow) (domain.Flow, error)
	ListScoped(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Flow, error)
	GetAccessible(ctx context.Context, user domain.AuthUser, id string) (*domain.Flow, error)
	UpdateAccessible(ctx context.Context, user domain.AuthUser, flow domain.Flow) error
	DeleteAccessible(ctx context.Context, user domain.AuthUser, id string) error
}

type ProjectService interface {
	List(ctx context.Context, user domain.AuthUser) ([]domain.Project, error)
	Get(ctx context.Context, user domain.AuthUser, projectID string) (*domain.Project, error)
	Create(ctx context.Context, user domain.AuthUser, name string, description string) (domain.Project, error)
	Update(ctx context.Context, user domain.AuthUser, project domain.Project) error
	Delete(ctx context.Context, user domain.AuthUser, projectID string) error
	ListMembers(ctx context.Context, user domain.AuthUser, projectID string) ([]domain.ProjectMember, error)
	AddMember(ctx context.Context, user domain.AuthUser, projectID string, identifier string, role string) error
	RemoveMember(ctx context.Context, user domain.AuthUser, projectID string, userID string) error
}

type RunService interface {
	Create(ctx context.Context, run domain.Run) (domain.Run, error)
	List(ctx context.Context) ([]domain.Run, error)
	ListForUser(ctx context.Context, userID string) ([]domain.Run, error)
	ListScopedForUser(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Run, error)
	Get(ctx context.Context, id string) (*domain.Run, error)
	GetForUser(ctx context.Context, id string, userID string) (*domain.Run, error)
	UpdateStatus(ctx context.Context, id string, status string, log string) error
}

type RunStepService interface {
	ListByRunID(ctx context.Context, runID string) ([]domain.RunStep, error)
	Get(ctx context.Context, runID string, stepIDOrKey string) (*domain.RunStep, error)
	CancelOpenSteps(ctx context.Context, runID string, message string) error
}

type SystemService interface {
	ResetWorkspace(ctx context.Context) error
}

type VariableService interface {
	ListScoped(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Variable, error)
	Create(ctx context.Context, user domain.AuthUser, scope string, projectID string, variable domain.Variable) (domain.Variable, error)
	Get(ctx context.Context, user domain.AuthUser, id string) (*domain.Variable, error)
	Update(ctx context.Context, user domain.AuthUser, id string, key *string, value *string) (*domain.Variable, error)
	Delete(ctx context.Context, user domain.AuthUser, id string) error
}
