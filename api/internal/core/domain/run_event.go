package domain

type RunUpdateEvent struct {
	RunID  string `json:"runId"`
	Status string `json:"status"`
	Log    string `json:"log,omitempty"`
}
