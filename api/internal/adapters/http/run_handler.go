package httpadapter

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/services"
	"flowcraft-api/internal/dto"
	flowtemporal "flowcraft-api/internal/temporal"
	"flowcraft-api/internal/utils"
	"flowcraft-api/pkg/apierrors"
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
	r.GET("/runs/history", h.history)
	r.GET("/runs/:id", h.get)
	r.GET("/runs/:id/steps", h.listSteps)
	r.GET("/runs/:id/steps/:stepId", h.getStep)
	r.POST("/runs/:id/cancel", h.cancel)
	r.GET("/stats", h.stats)
}

func toRFC3339(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.UTC().Format(time.RFC3339)
	return &s
}

func runToResponse(run domain.Run) dto.RunResponse {
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

func stepToResponse(step domain.RunStep) dto.RunStepResponse {
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
	scope := strings.TrimSpace(c.Query("scope"))
	projectID := strings.TrimSpace(c.Query("projectId"))
	user, _ := currentAuthUser(c)
	var (
		runs []domain.Run
		err  error
	)
	if scope == "" {
		runs, err = h.runs.ListForUser(c.Request.Context(), user.ID)
		if err != nil {
			utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
			return
		}
	} else {
		runs, err = h.runs.ListScopedForUser(c.Request.Context(), user, scope, projectID)
		if err != nil {
			if err == utils.ErrForbidden {
				utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
				return
			}
			utils.JSONError(c, http.StatusBadRequest, apierrors.ErrBadRequest, err.Error(), nil)
			return
		}
	}
	out := make([]dto.RunResponse, 0, len(runs))
	for _, r := range runs {
		out = append(out, runToResponse(r))
	}
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *RunHandler) get(c *gin.Context) {
	id := c.Param("id")
	user, _ := currentAuthUser(c)
	run, err := h.runs.GetForUser(c.Request.Context(), id, user.ID)
	if err == utils.ErrNotFound {
		utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "run not found", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, runToResponse(*run))
}

func (h *RunHandler) listSteps(c *gin.Context) {
	runID := c.Param("id")
	user, _ := currentAuthUser(c)
	if _, err := h.runs.GetForUser(c.Request.Context(), runID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "run not found", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	steps, err := h.steps.ListByRunID(c.Request.Context(), runID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	out := make([]dto.RunStepResponse, 0, len(steps))
	for _, s := range steps {
		out = append(out, stepToResponse(s))
	}
	utils.JSONResponse(c, http.StatusOK, out)
}

func (h *RunHandler) getStep(c *gin.Context) {
	runID := c.Param("id")
	stepID := c.Param("stepId")

	user, _ := currentAuthUser(c)
	if _, err := h.runs.GetForUser(c.Request.Context(), runID, user.ID); err != nil {
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "run not found", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	step, err := h.steps.Get(c.Request.Context(), runID, stepID)
	if err == utils.ErrNotFound {
		utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "step not found", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, stepToResponse(*step))
}

func (h *RunHandler) cancel(c *gin.Context) {
	runID := c.Param("id")
	user, _ := currentAuthUser(c)
	run, err := h.runs.GetForUser(c.Request.Context(), runID, user.ID)
	if err == utils.ErrNotFound {
		utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "run not found", nil)
		return
	}
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	if run.Status != "queued" && run.Status != "running" {
		utils.JSONError(c, http.StatusConflict, apierrors.ErrConflict, "run is not cancelable", nil)
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if err := h.temporalClient.CancelWorkflow(ctx, run.TemporalWorkflow, ""); err != nil {
		utils.JSONError(c, http.StatusBadGateway, apierrors.ErrTemporalUnavailable, err.Error(), nil)
		return
	}

	_ = h.steps.CancelOpenSteps(c.Request.Context(), runID, "canceled by user")
	_ = h.runs.UpdateStatus(c.Request.Context(), runID, "canceled", "canceled by user")

	updated, err := h.runs.GetForUser(c.Request.Context(), runID, user.ID)
	if err != nil {
		utils.JSONResponse(c, http.StatusOK, runToResponse(*run))
		return
	}
	utils.JSONResponse(c, http.StatusOK, runToResponse(*updated))
}

func (h *RunHandler) CreateForFlow(c *gin.Context) {
	flowID := c.Param("id")

	user, _ := currentAuthUser(c)
	if _, err := h.flows.GetAccessible(c.Request.Context(), user, flowID); err != nil {
		if err == utils.ErrNotFound {
			utils.JSONError(c, http.StatusNotFound, apierrors.ErrNotFound, "flow not found", nil)
			return
		}
		if err == utils.ErrForbidden {
			utils.JSONError(c, http.StatusForbidden, apierrors.ErrForbidden, "forbidden", nil)
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	now := time.Now().UTC()
	run := domain.Run{
		FlowID:    flowID,
		Status:    "queued",
		StartedAt: nil,
		Log:       "queued",
		CreatedAt: now,
		UpdatedAt: now,
	}
	created, err := h.runs.Create(c.Request.Context(), run)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if _, err := h.temporalClient.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        created.TemporalWorkflow,
		TaskQueue: flowtemporal.TaskQueue,
	}, flowtemporal.RunFlowWorkflow, flowtemporal.RunFlowInput{FlowID: flowID, RunID: created.ID}); err != nil {
		_ = h.runs.UpdateStatus(c.Request.Context(), created.ID, "failed", "failed to start workflow: "+err.Error())
		utils.JSONError(c, http.StatusBadGateway, apierrors.ErrTemporalUnavailable, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusAccepted, runToResponse(created))
}

func (h *RunHandler) stats(c *gin.Context) {
	user, _ := currentAuthUser(c)
	stats, err := h.runs.GetStats(c.Request.Context(), user.ID)
	if err != nil {
		logger := c.MustGet("logger").(zerolog.Logger)
		logger.Error().Err(err).Msg("failed to get run stats")
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, dto.RunStatsResponse{
		Total:   stats.Total,
		Success: stats.Success,
		Failed:  stats.Failed,
		Running: stats.Running,
		Queued:  stats.Queued,
	})
}

func (h *RunHandler) history(c *gin.Context) {
	user := c.MustGet("authUser").(domain.AuthUser)

	// S5: accept ?days=N, default 7
	days := 7
	if d, err := strconv.Atoi(c.Query("days")); err == nil && d > 0 && d <= 90 {
		days = d
	}

	stats, err := h.runs.GetDailyStats(c.Request.Context(), user.ID, days)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, apierrors.ErrInternalServer, err.Error(), nil)
		return
	}
	// Convert to response format
	type dailyStatResponse struct {
		Date    string `json:"date"`
		Total   int    `json:"total"`
		Success int    `json:"success"`
		Failed  int    `json:"failed"`
	}
	out := make([]dailyStatResponse, len(stats))
	for i, s := range stats {
		out[i] = dailyStatResponse{
			Date:    s.Date,
			Total:   s.Total,
			Success: s.Success,
			Failed:  s.Failed,
		}
	}
	utils.JSONResponse(c, http.StatusOK, out)
}
