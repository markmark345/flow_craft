package dto

import "encoding/json"

type RunStepResponse struct {
	ID         string          `json:"id"`
	RunID      string          `json:"runId"`
	StepKey    string          `json:"stepKey"`
	Name       string          `json:"name"`
	Status     string          `json:"status"`
	NodeID     string          `json:"nodeId,omitempty"`
	NodeType   string          `json:"nodeType,omitempty"`
	StartedAt  *string         `json:"startedAt,omitempty"`
	FinishedAt *string         `json:"finishedAt,omitempty"`
	Inputs     json.RawMessage `json:"inputs,omitempty"`
	Outputs    json.RawMessage `json:"outputs,omitempty"`
	Log        string          `json:"log,omitempty"`
	Error      string          `json:"error,omitempty"`
	CreatedAt  string          `json:"createdAt,omitempty"`
	UpdatedAt  string          `json:"updatedAt,omitempty"`
}

