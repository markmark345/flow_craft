package entities

import (
	"encoding/json"
	"time"
)

type RunStep struct {
	ID          string
	RunID       string
	StepKey     string
	Name        string
	Status      string
	NodeID      string
	NodeType    string
	InputsJSON  json.RawMessage
	OutputsJSON json.RawMessage
	Log         string
	Error       string
	StartedAt   *time.Time
	FinishedAt  *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
