package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/mailer"
	"flowcraft-api/internal/repositories"
	"flowcraft-api/internal/utils"
)

type AuthUser struct {
	ID    string
	Name  string
	Email string
}

type AuthService struct {
	users          *repositories.UserRepository
	sessions       *repositories.AuthSessionRepository
	passwordResets *repositories.PasswordResetRepository
	mailer         *mailer.Mailer
	appBaseURL     string
	resetTTL       time.Duration
}

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrConflict           = errors.New("conflict")
)

func NewAuthService(
	users *repositories.UserRepository,
	sessions *repositories.AuthSessionRepository,
	passwordResets *repositories.PasswordResetRepository,
	mailer *mailer.Mailer,
	appBaseURL string,
) *AuthService {
	return &AuthService{
		users:          users,
		sessions:       sessions,
		passwordResets: passwordResets,
		mailer:         mailer,
		appBaseURL:     strings.TrimRight(appBaseURL, "/"),
		resetTTL:       60 * time.Minute,
	}
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

	token, err := s.CreateSession(ctx, user.ID)
	if err != nil {
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

	if strings.TrimSpace(user.PasswordHash) == "" {
		return "", AuthUser{}, ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", AuthUser{}, ErrInvalidCredentials
	}

	token, err := s.CreateSession(ctx, user.ID)
	if err != nil {
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

func (s *AuthService) CreateSession(ctx context.Context, userID string) (string, error) {
	token := utils.NewUUID()
	if err := s.sessions.Create(ctx, token, userID); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) RequestPasswordReset(ctx context.Context, email string, lang string) error {
	email = normalize(email)
	if email == "" {
		return nil
	}
	user, err := s.users.GetByEmail(ctx, email)
	if err == utils.ErrNotFound {
		return nil
	}
	if err != nil {
		return err
	}
	if s.passwordResets == nil || s.mailer == nil {
		return errors.New("password reset not configured")
	}
	rawToken, err := utils.GenerateToken(32)
	if err != nil {
		return err
	}
	hash := sha256.Sum256([]byte(rawToken))
	now := time.Now().UTC()
	reset := entities.PasswordReset{
		ID:        utils.NewUUID(),
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(hash[:]),
		ExpiresAt: now.Add(s.resetTTL),
	}
	if err := s.passwordResets.Create(ctx, reset); err != nil {
		return err
	}
	resetURL := s.appBaseURL + "/reset-password?token=" + rawToken
	return s.mailer.SendPasswordReset(ctx, user.Email, user.Name, resetURL, int(s.resetTTL.Minutes()), lang)
}

func (s *AuthService) ResetPassword(ctx context.Context, rawToken string, newPassword string) error {
	rawToken = strings.TrimSpace(rawToken)
	newPassword = strings.TrimSpace(newPassword)
	if rawToken == "" || newPassword == "" {
		return errors.New("token and password are required")
	}
	if s.passwordResets == nil {
		return errors.New("password reset not configured")
	}
	hash := sha256.Sum256([]byte(rawToken))
	reset, err := s.passwordResets.GetByTokenHash(ctx, hex.EncodeToString(hash[:]))
	if err != nil {
		return err
	}
	if reset.UsedAt != nil {
		return errors.New("reset token already used")
	}
	if time.Now().UTC().After(reset.ExpiresAt) {
		return errors.New("reset token expired")
	}
	if newPassword == "" {
		return errors.New("password is required")
	}
	enc, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(ctx, reset.UserID, string(enc)); err != nil {
		return err
	}
	return s.passwordResets.MarkUsed(ctx, reset.ID)
}
