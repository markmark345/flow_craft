package dto

type ProjectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type ProjectResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Role        string `json:"role,omitempty"`
	CreatedAt   string `json:"createdAt,omitempty"`
	UpdatedAt   string `json:"updatedAt,omitempty"`
}

type ProjectRef struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type ProjectMemberRequest struct {
	Identifier string `json:"identifier"`
	Role       string `json:"role,omitempty"`
}

type ProjectMemberResponse struct {
	User UserResponse `json:"user"`
	Role string       `json:"role"`
}

