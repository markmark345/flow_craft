package temporal

import (
	"database/sql"
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/repositories"

	"go.temporal.io/sdk/worker"
)

const TaskQueue = "flowcraft-tasks"

type Worker struct {
	worker worker.Worker
	sched  *FlowCronScheduler
}

func NewWorker(cfg config.Config, logger interface{}, db *sql.DB) (*Worker, error) {
	_ = logger
	c, err := NewClient(cfg)
	if err != nil {
		return nil, err
	}
	w := worker.New(c, TaskQueue, worker.Options{})
	w.RegisterWorkflow(RunFlowWorkflow)
	w.RegisterActivity(NewActivities(
		repositories.NewFlowRepository(db),
		repositories.NewRunRepository(db),
		repositories.NewRunStepRepository(db),
	))
	return &Worker{worker: w, sched: NewFlowCronScheduler(db, c)}, nil
}

func (w *Worker) Run() error {
	if w.sched != nil {
		w.sched.Start()
		defer w.sched.Stop()
	}
	return w.worker.Run(worker.InterruptCh())
}
