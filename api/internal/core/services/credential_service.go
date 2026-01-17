package services

import (
	"context"
	"errors"
	"strings"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/ports"
	"flowcraft-api/internal/utils"
)

type CredentialService struct {
	creds          ports.CredentialRepository
	projectMembers ports.ProjectMemberRepository
	encKey         []byte
}

func NewCredentialService(
	creds ports.CredentialRepository,
	projectMembers ports.ProjectMemberRepository,
	encKeyRaw string,
) (*CredentialService, error) {
	var key []byte
	if strings.TrimSpace(encKeyRaw) != "" {
		parsed, err := utils.DecodeBase64Key(encKeyRaw)
		if err != nil {
			return nil, err
		}
		key = parsed
	}
	return &CredentialService{creds: creds, projectMembers: projectMembers, encKey: key}, nil
}

func (s *CredentialService) EncryptPayload(payload any) (string, error) {
	if len(s.encKey) == 0 {
		return "", errors.New("credential encryption key not configured")
	}
	return utils.EncryptJSON(s.encKey, payload)
}

func (s *CredentialService) DecryptPayload(encrypted string, out any) error {
	if len(s.encKey) == 0 {
		return errors.New("credential encryption key not configured")
	}
	return utils.DecryptJSON(s.encKey, encrypted, out)
}

func (s *CredentialService) ListScoped(ctx context.Context, user domain.AuthUser, scope string, projectID string) ([]domain.Credential, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		return s.creds.ListForUser(ctx, user.ID)
	}
	if scope != "project" {
		return nil, errors.New("invalid scope")
	}
	if strings.TrimSpace(projectID) == "" {
		return nil, errors.New("projectId is required for project scope")
	}
	if s.projectMembers == nil {
		return nil, utils.ErrForbidden
	}
	if _, err := s.projectMembers.GetRole(ctx, projectID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			return nil, utils.ErrForbidden
		}
		return nil, err
	}
	return s.creds.ListForProject(ctx, projectID)
}

func (s *CredentialService) Create(ctx context.Context, user domain.AuthUser, scope string, projectID string, cred domain.Credential) (domain.Credential, error) {
	scope = strings.TrimSpace(scope)
	if scope == "" || scope == "personal" {
		cred.UserID = user.ID
		cred.ProjectID = ""
	} else if scope == "project" {
		if strings.TrimSpace(projectID) == "" {
			return domain.Credential{}, errors.New("projectId is required for project scope")
		}
		if s.projectMembers == nil {
			return domain.Credential{}, utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, projectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return domain.Credential{}, utils.ErrForbidden
			}
			return domain.Credential{}, err
		}
		if role != "admin" {
			return domain.Credential{}, utils.ErrForbidden
		}
		cred.ProjectID = projectID
		cred.UserID = user.ID
	} else {
		return domain.Credential{}, errors.New("invalid scope")
	}

	if cred.ID == "" {
		cred.ID = utils.NewUUID()
	}
	if strings.TrimSpace(cred.Name) == "" {
		return domain.Credential{}, errors.New("name is required")
	}
	if strings.TrimSpace(cred.Provider) == "" {
		return domain.Credential{}, errors.New("provider is required")
	}
	if strings.TrimSpace(cred.DataEncrypted) == "" {
		return domain.Credential{}, errors.New("credential payload is required")
	}

	if err := s.creds.Create(ctx, cred); err != nil {
		return domain.Credential{}, err
	}
	return cred, nil
}

func (s *CredentialService) Get(ctx context.Context, user domain.AuthUser, id string) (*domain.Credential, error) {
	cred, err := s.creds.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if cred.ProjectID == "" {
		if cred.UserID != user.ID {
			return nil, utils.ErrForbidden
		}
		return cred, nil
	}
	if s.projectMembers == nil {
		return nil, utils.ErrForbidden
	}
	if _, err := s.projectMembers.GetRole(ctx, cred.ProjectID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			return nil, utils.ErrForbidden
		}
		return nil, err
	}
	return cred, nil
}

func (s *CredentialService) Update(ctx context.Context, user domain.AuthUser, cred domain.Credential) error {
	existing, err := s.creds.Get(ctx, cred.ID)
	if err != nil {
		return err
	}
	if existing.ProjectID == "" {
		if existing.UserID != user.ID {
			return utils.ErrForbidden
		}
	} else {
		if s.projectMembers == nil {
			return utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, existing.ProjectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return utils.ErrForbidden
			}
			return err
		}
		if role != "admin" {
			return utils.ErrForbidden
		}
	}
	if cred.UserID == "" {
		cred.UserID = existing.UserID
	}
	if cred.ProjectID == "" {
		cred.ProjectID = existing.ProjectID
	}
	if cred.Provider == "" {
		cred.Provider = existing.Provider
	}
	if cred.Name == "" {
		cred.Name = existing.Name
	}
	if cred.DataEncrypted == "" {
		cred.DataEncrypted = existing.DataEncrypted
	}
	return s.creds.Update(ctx, cred)
}

func (s *CredentialService) Delete(ctx context.Context, user domain.AuthUser, id string) error {
	cred, err := s.creds.Get(ctx, id)
	if err != nil {
		return err
	}
	if cred.ProjectID == "" {
		if cred.UserID != user.ID {
			return utils.ErrForbidden
		}
	} else {
		if s.projectMembers == nil {
			return utils.ErrForbidden
		}
		role, err := s.projectMembers.GetRole(ctx, cred.ProjectID, user.ID)
		if err != nil {
			if err == utils.ErrNotFound {
				return utils.ErrForbidden
			}
			return err
		}
		if role != "admin" {
			return utils.ErrForbidden
		}
	}
	return s.creds.Delete(ctx, id)
}
