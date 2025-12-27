package entities

import "time"

type Variable struct {
	ID        string
	UserID    string
	ProjectID string
	Key       string
	Value     string
	CreatedAt time.Time
	UpdatedAt time.Time
}
