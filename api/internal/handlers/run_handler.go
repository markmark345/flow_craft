package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/dto"
	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/services"
	flowtemporal "flowcraft-api/internal/temporal"
	"flowcraft-api/internal/utils"
)

type RunHandler struct {
	runs           *services.RunService
	flows          *services.FlowService
	steps          *services.RunStepService
	temporalClient client.Client
}

func NewRunHandler(
	runs *services.RunService,
	flows *services.FlowService,
	steps *services.RunStepService,
	temporalClient client.Client,
) *RunHandler {
	return &RunHandler{runs: runs, flows: flows, steps: steps, temporalClient: temporalClient}
}

func (h *RunHandler) Register(r *gin.RouterGroup) {
	r.GET("/runs", h.list)
	r.GET("/runs/:id", h.get)
	r.GET("/runs/:id/steps", h.listSteps)
	r.GET("/runs/:id/steps/:stepId", h.getStep)
	r.POST("/runs/:id/cancel", h.cancel)
}

func toRFC3339(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.UTC().Format(time.RFC3339)
	return &s
}

func runToResponse(run entities.Run) dto.RunResponse {
	createdAt := ""
	updatedAt := ""
	if !run.CreatedAt.IsZero() {
		createdAt = run.CreatedAt.UTC().Format(time.RFC3339)
	}
	if !run.UpdatedAt.IsZero() {
		updatedAt = run.UpdatedAt.UTC().Format(time.RFC3339)
	}

	return dto.RunResponse{
		ID:         run.ID,
		FlowID:     run.FlowID,
		Status:     run.Status,
		StartedAt:  toRFC3339(run.StartedAt),
		FinishedAt: toRFC3339(run.FinishedAt),
		Log:        run.Log,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}
}

func stepToResponse(step entities.RunStep) dto.RunStepResponse {
	createdAt := ""
	updatedAt := ""
	if !step.CreatedAt.IsZero() {
		createdAt = step.CreatedAt.UTC().Format(time.RFC3339)
	}
	if !step.UpdatedAt.IsZero() {
		updatedAt = step.UpdatedAt.UTC().Format(time.RFC3339)
	}

	return dto.RunStepResponse{
		ID:         step.ID,
		RunID:      step.RunID,
		StepKey:    step.StepKey,
		Name:       step.Name,
		Status:     step.Status,
		NodeID:     step.NodeID,
		NodeType:   step.NodeType,
		StartedAt:  toRFC3339(step.StartedAt),
		FinishedAt: toRFC3339(step.FinishedAt),
		Inputs:     step.InputsJSON,
		Outputs:    step.OutputsJSON,
		Log:        step.Log,
		Error:      step.Error,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}
}

func (h *RunHandler) list(c *gin.Context) {
	user, _ := currentAuthUser(c)
	runs, err := h.runs.ListForUser(c, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	out := make([]dto.RunResponse, 0, len(runs))
	for _, r := range runs {
		out = append(out, runToResponse(r))
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *RunHandler) get(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	run, err := h.runs.GetForUser(c, id, user.ID)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "run not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: runToResponse(*run)})
}

func (h *RunHandler) listSteps(c *gin.Context) {
	runID := c.Param("id")
	user, _ := currentAuthUser(c)
	if _, err := h.runs.GetForUser(c, runID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "run not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	steps, err := h.steps.ListByRunID(c, runID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	out := make([]dto.RunStepResponse, 0, len(steps))
	for _, s := range steps {
		out = append(out, stepToResponse(s))
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: out})
}

func (h *RunHandler) getStep(c *gin.Context) {
	runID := c.Param("id")
	stepID := c.Param("stepId")

	user, _ := currentAuthUser(c)
	if _, err := h.runs.GetForUser(c, runID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "run not found"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	step, err := h.steps.Get(c, runID, stepID)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "step not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: stepToResponse(*step)})
}

func (h *RunHandler) cancel(c *gin.Context) {
	runID := c.Param("id")
	user, _ := currentAuthUser(c)
	run, err := h.runs.GetForUser(c, runID, user.ID)
	if err == utils.ErrNotFound {
		c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "run not found"}})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	if run.Status != "queued" && run.Status != "running" {
		c.JSON(http.StatusConflict, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_cancelable", Message: "run is not cancelable"}})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if err := h.temporalClient.CancelWorkflow(ctx, run.TemporalWorkflow, ""); err != nil {
		c.JSON(http.StatusBadGateway, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "temporal_unavailable", Message: err.Error()}})
		return
	}

	_ = h.steps.CancelOpenSteps(c, runID, "canceled by user")
	_ = h.runs.UpdateStatus(c, runID, "canceled", "canceled by user")

	updated, err := h.runs.GetForUser(c, runID, user.ID)
	if err != nil {
		c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: runToResponse(*run)})
		return
	}
	c.JSON(http.StatusOK, dto.ResponseEnvelope{Data: runToResponse(*updated)})
}

func (h *RunHandler) CreateForFlow(c *gin.Context) {
	flowID := c.Param("id")

	user, _ := currentAuthUser(c)
	if _, err := h.flows.GetAccessible(c, user, flowID); err != nil {
		if err == utils.ErrNotFound {
			c.JSON(http.StatusNotFound, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "not_found", Message: "flow not found"}})
			return
		}
		if err == utils.ErrForbidden {
			c.JSON(http.StatusForbidden, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "forbidden", Message: "forbidden"}})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	now := time.Now().UTC()
	run := entities.Run{
		FlowID:    flowID,
		Status:    "queued",
		StartedAt: nil,
		Log:       "queued",
		CreatedAt: now,
		UpdatedAt: now,
	}
	created, err := h.runs.Create(c, run)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "internal", Message: err.Error()}})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if _, err := h.temporalClient.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        created.TemporalWorkflow,
		TaskQueue: flowtemporal.TaskQueue,
	}, flowtemporal.RunFlowWorkflow, flowtemporal.RunFlowInput{FlowID: flowID, RunID: created.ID}); err != nil {
		_ = h.runs.UpdateStatus(c, created.ID, "failed", "failed to start workflow: "+err.Error())
		c.JSON(http.StatusBadGateway, dto.ResponseEnvelope{Error: &dto.ErrorBody{Code: "temporal_unavailable", Message: err.Error()}})
		return
	}

	c.JSON(http.StatusAccepted, dto.ResponseEnvelope{Data: runToResponse(created)})
}
