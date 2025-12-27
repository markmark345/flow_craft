package entities

import "time"

type Credential struct {
	ID            string
	UserID        string
	ProjectID     string
	Provider      string
	Name          string
	DataEncrypted string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
