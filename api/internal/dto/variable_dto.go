package dto

type VariableCreateRequest struct {
	Scope     string `json:"scope"`
	ProjectID string `json:"projectId"`
	Key       string `json:"key"`
	Value     string `json:"value"`
}

type VariableUpdateRequest struct {
	Key   *string `json:"key"`
	Value *string `json:"value"`
}

type VariableResponse struct {
	ID        string `json:"id"`
	Key       string `json:"key"`
	Value     string `json:"value"`
	Scope     string `json:"scope"`
	ProjectID string `json:"projectId,omitempty"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
