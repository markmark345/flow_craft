package domain

import "time"

type Flow struct {
	ID             string
	Name           string
	Description    string
	Scope          string
	Status         string
	Version        int
	DefinitionJSON string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	CreatedBy      string
	UpdatedBy      string
	OwnerUserID    string
	ProjectID      string
	Owner          *UserRef
	Project        *ProjectRef
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
