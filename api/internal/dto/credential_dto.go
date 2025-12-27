package dto

type CredentialRequest struct {
	Provider  string         `json:"provider"`
	Name      string         `json:"name"`
	Scope     string         `json:"scope"`
	ProjectID string         `json:"projectId"`
	Data      map[string]any `json:"data"`
}

type CredentialResponse struct {
	ID           string `json:"id"`
	Provider     string `json:"provider"`
	Name         string `json:"name"`
	Scope        string `json:"scope"`
	ProjectID    string `json:"projectId,omitempty"`
	AccountEmail string `json:"accountEmail,omitempty"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

type CredentialOAuthStartRequest struct {
	Scope     string `json:"scope"`
	ProjectID string `json:"projectId"`
	Name      string `json:"name"`
	ReturnTo  string `json:"returnTo"`
}

type OAuthStartResponse struct {
	URL string `json:"url"`
}
