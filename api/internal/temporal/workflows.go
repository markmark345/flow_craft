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
	ao := workflow.ActivityOptions{
		StartToCloseTimeout:    time.Minute,
		ScheduleToCloseTimeout: time.Minute * 5,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var def string
	if err := workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "running", "running").Get(ctx, nil); err != nil {
		return err
	}

	if err := workflow.ExecuteActivity(ctx, "LoadFlowDefinitionActivity", input.FlowID).Get(ctx, &def); err != nil {
		_ = workflow.ExecuteActivity(ctx, "UpdateRunStatusActivity", input.RunID, "failed", "failed to load flow").Get(ctx, nil)
		return err
	}

	var summary string
	if err := workflow.ExecuteActivity(ctx, "ExecuteNodeActivity", input.RunID, def).Get(ctx, &summary); err != nil {
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
