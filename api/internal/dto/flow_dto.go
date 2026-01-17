package dto

type FlowRequest struct {
	Name           string `json:"name"`
	Description    string `json:"description,omitempty"`
	Scope          string `json:"scope,omitempty"`
	ProjectID      string `json:"projectId,omitempty"`
	Status         string `json:"status"`
	Version        int    `json:"version"`
	DefinitionJSON string `json:"definitionJson"`
}

type FlowResponse struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Description    string        `json:"description,omitempty"`
	Scope          string        `json:"scope,omitempty"`
	ProjectID      string        `json:"projectId,omitempty"`
	Project        *ProjectRef   `json:"project,omitempty"`
	Status         string        `json:"status"`
	Version        int           `json:"version"`
	DefinitionJSON string        `json:"definitionJson"`
	UpdatedAt      string        `json:"updatedAt,omitempty"`
	Owner          *UserResponse `json:"owner,omitempty"`
}

type RunRequest struct {
	FlowID string `json:"flowId"`
}

type RunResponse struct {
	ID         string  `json:"id"`
	FlowID     string  `json:"flowId"`
	Status     string  `json:"status"`
	StartedAt  *string `json:"startedAt,omitempty"`
	FinishedAt *string `json:"finishedAt,omitempty"`
	Log        string  `json:"log,omitempty"`
	CreatedAt  string  `json:"createdAt,omitempty"`
	UpdatedAt  string  `json:"updatedAt,omitempty"`
}
