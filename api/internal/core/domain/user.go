package domain

import "time"

type User struct {
	ID           string
	Name         string
	Email        string
	Username     string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
