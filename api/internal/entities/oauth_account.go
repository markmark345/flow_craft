package entities

import "time"

type OAuthAccount struct {
	ID             string
	UserID         string
	Provider       string
	ProviderUserID string
	AccessToken    string
	RefreshToken   string
	TokenExpiry    *time.Time
	Scopes         string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
