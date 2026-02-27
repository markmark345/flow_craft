package ports

import (
	"context"
	"time"

	"flowcraft-api/internal/core/domain"
)

type AuthSessionRepository interface {
	Create(ctx context.Context, token string, userID string) error
	Delete(ctx context.Context, token string) error
	GetUserByToken(ctx context.Context, token string) (*domain.User, error)
}

type CredentialRepository interface {
	Create(ctx context.Context, cred domain.Credential) error
	ListForUser(ctx context.Context, userID string) ([]domain.Credential, error)
	ListForProject(ctx context.Context, projectID string) ([]domain.Credential, error)
	Get(ctx context.Context, id string) (*domain.Credential, error)
	Update(ctx context.Context, cred domain.Credential) error
	Delete(ctx context.Context, id string) error
}

type FlowRepository interface {
	Create(ctx context.Context, flow domain.Flow) error
	List(ctx context.Context) ([]domain.Flow, error)
	ListByOwner(ctx context.Context, userID string) ([]domain.Flow, error)
	ListByProject(ctx context.Context, projectID string) ([]domain.Flow, error)
	Get(ctx context.Context, id string) (*domain.Flow, error)
	Update(ctx context.Context, flow domain.Flow) error
	Delete(ctx context.Context, id string) error
	DeleteByProject(ctx context.Context, projectID string) error
}

type OAuthAccountRepository interface {
	Upsert(ctx context.Context, account domain.OAuthAccount) error
	GetByProviderUserID(ctx context.Context, provider string, providerUserID string) (*domain.OAuthAccount, error)
	ListByUser(ctx context.Context, userID string) ([]domain.OAuthAccount, error)
	DeleteByUser(ctx context.Context, userID string, provider string) error
}

type PasswordResetRepository interface {
	Create(ctx context.Context, reset domain.PasswordReset) error
	GetByTokenHash(ctx context.Context, tokenHash string) (*domain.PasswordReset, error)
	MarkUsed(ctx context.Context, id string) error
	DeleteExpired(ctx context.Context, before time.Time) error
}

type ProjectMemberRepository interface {
	Upsert(ctx context.Context, projectID string, userID string, role string) error
	Remove(ctx context.Context, projectID string, userID string) error
	GetRole(ctx context.Context, projectID string, userID string) (string, error)
	ListMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error)
}

type ProjectRepository interface {
	Create(ctx context.Context, project domain.Project) error
	ListByUser(ctx context.Context, userID string) ([]domain.Project, error)
	GetForUser(ctx context.Context, projectID string, userID string) (*domain.Project, error)
	Update(ctx context.Context, project domain.Project) error
	Delete(ctx context.Context, projectID string) error
}

type RunRepository interface {
	Create(ctx context.Context, run domain.Run) error
	List(ctx context.Context) ([]domain.Run, error)
	ListForUser(ctx context.Context, userID string) ([]domain.Run, error)
	ListByOwner(ctx context.Context, userID string) ([]domain.Run, error)
	ListByProject(ctx context.Context, projectID string) ([]domain.Run, error)
	Get(ctx context.Context, id string) (*domain.Run, error)
	GetForUser(ctx context.Context, id string, userID string) (*domain.Run, error)
	GetStats(ctx context.Context, userID string) (*domain.RunStats, error)
	GetDailyStats(ctx context.Context, userID string, days int) ([]domain.DailyStat, error)
	UpdateStatus(ctx context.Context, id string, status string, log string) error
}

type RunStepRepository interface {
	CreateMany(ctx context.Context, steps []domain.RunStep) error
	ListByRunID(ctx context.Context, runID string) ([]domain.RunStep, error)
	Get(ctx context.Context, runID string, stepIDOrKey string) (*domain.RunStep, error)
	UpdateState(ctx context.Context, id string, status string, inputsJSON []byte, outputsJSON []byte, logText string, errText string) error
	CancelOpenSteps(ctx context.Context, runID string, message string) error
}

type SystemRepository interface {
	ResetWorkspace(ctx context.Context) error
}

type UserRepository interface {
	Create(ctx context.Context, user domain.User) error
	GetByEmailOrUsername(ctx context.Context, identifier string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	Get(ctx context.Context, id string) (*domain.User, error)
	UpdatePassword(ctx context.Context, userID string, passwordHash string) error
}

type VariableRepository interface {
	Create(ctx context.Context, variable domain.Variable) error
	ListForUser(ctx context.Context, userID string) ([]domain.Variable, error)
	ListGlobal(ctx context.Context) ([]domain.Variable, error)
	ListForProject(ctx context.Context, projectID string) ([]domain.Variable, error)
	Get(ctx context.Context, id string) (*domain.Variable, error)
	Update(ctx context.Context, variable domain.Variable) error
	Delete(ctx context.Context, id string) error
}
