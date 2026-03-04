package temporal

import (
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

type RunFlowInput struct {
	FlowID string
	RunID  string
}

func RunFlowWorkflow(ctx workflow.Context, input RunFlowInput) error {
	// Status/load activities are idempotent and safe to retry.
	ao := workflow.ActivityOptions{
		StartToCloseTimeout:    time.Minute,
		ScheduleToCloseTimeout: time.Minute * 5,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// ExecuteNodeActivity must not auto-retry: a failure means a node failed
	// and the run should be marked failed, not silently re-run from node 1.
	execCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout:    time.Minute * 10,
		ScheduleToCloseTimeout: time.Minute * 30,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var def string
	if err := workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "running", "running").Get(ctx, nil); err != nil {
		return err
	}

	if err := workflow.ExecuteActivity(ctx, "LoadFlowDefinitionActivity", input.FlowID).Get(ctx, &def); err != nil {
		_ = workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "failed", "failed to load flow").Get(ctx, nil)
		return err
	}

	var summary string
	if err := workflow.ExecuteActivity(execCtx, "ExecuteNodeActivity", input.RunID, def).Get(ctx, &summary); err != nil {
		if temporal.IsCanceledError(err) {
			_ = workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "canceled", "canceled").Get(ctx, nil)
			return err
		}
		_ = workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "failed", "execution failed").Get(ctx, nil)
		return err
	}

	logText := "completed"
	if summary != "" {
		logText = "completed: " + summary
	}
	return workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "success", logText).Get(ctx, nil)
}
