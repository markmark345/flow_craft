package dto

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

type RunStatsResponse struct {
	Total   int `json:"total"`
	Success int `json:"success"`
	Failed  int `json:"failed"`
	Running int `json:"running"`
	Queued  int `json:"queued"`
}
