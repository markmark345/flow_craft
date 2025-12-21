package entities

import "time"

type Flow struct {
	ID             string
	Name           string
	Status         string
	Version        int
	DefinitionJSON string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	CreatedBy      string
	UpdatedBy      string
	Owner          *UserRef
}

type Run struct {
	ID               string
	FlowID           string
	Status           string
	StartedAt        *time.Time
	FinishedAt       *time.Time
	Log              string
	TemporalWorkflow string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
