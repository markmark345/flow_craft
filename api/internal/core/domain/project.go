package domain

import "time"

type Project struct {
	ID          string
	Name        string
	Description string
	CreatedBy   string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Role        string
}

type ProjectMember struct {
	ProjectID string
	UserID    string
	Role      string
	CreatedAt time.Time
	User      *UserRef
}

type ProjectRef struct {
	ID   string
	Name string
}

