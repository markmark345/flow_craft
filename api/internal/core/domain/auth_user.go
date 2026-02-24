package domain

type AuthUser struct {
	ID    string
	Name  string
	Email string
	Role  string // "user" | "system_admin"
}
