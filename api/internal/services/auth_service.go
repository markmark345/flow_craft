package services

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type AuthUser struct {
	ID    string
	Name  string
	Email string
}

type AuthService struct {
	users    *repositories.UserRepository
	sessions *repositories.AuthSessionRepository
}

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrConflict           = errors.New("conflict")
)

func NewAuthService(users *repositories.UserRepository, sessions *repositories.AuthSessionRepository) *AuthService {
	return &AuthService{users: users, sessions: sessions}
}

func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func (s *AuthService) SignUp(ctx context.Context, name string, email string, username string, password string) (string, AuthUser, error) {
	name = strings.TrimSpace(name)
	email = normalize(email)
	username = normalize(username)
	password = strings.TrimSpace(password)

	if email == "" || !strings.Contains(email, "@") {
		return "", AuthUser{}, errors.New("valid email is required")
	}
	if username == "" {
		username = strings.SplitN(email, "@", 2)[0]
	}
	if name == "" {
		name = username
	}
	if password == "" {
		return "", AuthUser{}, errors.New("password is required")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", AuthUser{}, err
	}

	user := entities.User{
		ID:           utils.NewUUID(),
		Name:         name,
		Email:        email,
		Username:     username,
		PasswordHash: string(hash),
	}

	if err := s.users.Create(ctx, user); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return "", AuthUser{}, ErrConflict
		}
		return "", AuthUser{}, err
	}

	token := utils.NewUUID()
	if err := s.sessions.Create(ctx, token, user.ID); err != nil {
		return "", AuthUser{}, err
	}

	return token, AuthUser{ID: user.ID, Name: user.Name, Email: user.Email}, nil
}

func (s *AuthService) Login(ctx context.Context, identifier string, password string) (string, AuthUser, error) {
	identifier = normalize(identifier)
	password = strings.TrimSpace(password)
	if identifier == "" || password == "" {
		return "", AuthUser{}, errors.New("identifier and password are required")
	}

	user, err := s.users.GetByEmailOrUsername(ctx, identifier)
	if err == utils.ErrNotFound {
		return "", AuthUser{}, ErrInvalidCredentials
	}
	if err != nil {
		return "", AuthUser{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", AuthUser{}, ErrInvalidCredentials
	}

	token := utils.NewUUID()
	if err := s.sessions.Create(ctx, token, user.ID); err != nil {
		return "", AuthUser{}, err
	}

	return token, AuthUser{ID: user.ID, Name: user.Name, Email: user.Email}, nil
}

func (s *AuthService) Validate(ctx context.Context, token string) (AuthUser, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return AuthUser{}, utils.ErrNotFound
	}
	user, err := s.sessions.GetUserByToken(ctx, token)
	if err != nil {
		return AuthUser{}, err
	}
	return AuthUser{ID: user.ID, Name: user.Name, Email: user.Email}, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil
	}
	return s.sessions.Delete(ctx, token)
}
