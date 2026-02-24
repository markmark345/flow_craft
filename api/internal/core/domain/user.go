package domain

import "time"

type User struct {
	ID           string
	Name         string
	Email        string
	Username     string
	PasswordHash string
	Role         string // "user" | "system_admin"
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
