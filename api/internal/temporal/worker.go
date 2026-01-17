package temporal

import (
	"database/sql"
	"flowcraft-api/internal/adapters/database/postgres"
	"flowcraft-api/internal/config"

	"github.com/rs/zerolog"
	"go.temporal.io/sdk/worker"
)

const TaskQueue = "flowcraft-tasks"

type Worker struct {
	worker worker.Worker
	sched  *FlowCronScheduler
}

func NewWorker(cfg config.Config, logger zerolog.Logger, db *sql.DB) (*Worker, error) {
	c, err := NewClient(cfg)
	if err != nil {
		return nil, err
	}
	w := worker.New(c, TaskQueue, worker.Options{})
	w.RegisterWorkflow(RunFlowWorkflow)
	activities, err := NewActivities(
		cfg,
		postgres.NewFlowRepository(db),
		postgres.NewRunRepository(db),
		postgres.NewRunStepRepository(db),
		postgres.NewCredentialRepository(db),
	)
	if err != nil {
		return nil, err
	}
	w.RegisterActivity(activities)
	return &Worker{worker: w, sched: NewFlowCronScheduler(db, c, logger)}, nil
}

func (w *Worker) Run() error {
	if w.sched != nil {
		w.sched.Start()
		defer w.sched.Stop()
	}
	return w.worker.Run(worker.InterruptCh())
}
