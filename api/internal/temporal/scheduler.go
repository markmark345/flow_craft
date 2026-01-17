package temporal

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/robfig/cron"
	"github.com/rs/zerolog"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/adapters/database/postgres"
	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/core/services"
)

type FlowCronScheduler struct {
	flows         *postgres.FlowRepository
	runs          *services.RunService
	temporal      client.Client
	logger        zerolog.Logger
	mu            sync.Mutex
	cronRunner    *cron.Cron
	currentByFlow map[string]string
	stopCh        chan struct{}
	doneCh        chan struct{}
}

func NewFlowCronScheduler(db *sql.DB, temporalClient client.Client, logger zerolog.Logger) *FlowCronScheduler {
	return &FlowCronScheduler{
		flows:         postgres.NewFlowRepository(db),
		runs:          services.NewRunService(postgres.NewRunRepository(db), nil),
		temporal:      temporalClient,
		logger:        logger,
		currentByFlow: map[string]string{},
	}
}

func (s *FlowCronScheduler) Start() {
	s.mu.Lock()
	if s.stopCh != nil {
		s.mu.Unlock()
		return
	}
	s.stopCh = make(chan struct{})
	s.doneCh = make(chan struct{})
	stopCh := s.stopCh
	doneCh := s.doneCh
	s.mu.Unlock()

	go func() {
		defer close(doneCh)
		s.loop(stopCh)
	}()
}

func (s *FlowCronScheduler) Stop() {
	s.mu.Lock()
	stopCh := s.stopCh
	doneCh := s.doneCh
	s.stopCh = nil
	s.doneCh = nil
	s.mu.Unlock()

	if stopCh != nil {
		close(stopCh)
	}
	if doneCh != nil {
		<-doneCh
	}
}

func (s *FlowCronScheduler) loop(stopCh <-chan struct{}) {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	s.reconcile()
	for {
		select {
		case <-stopCh:
			s.stopCron()
			return
		case <-ticker.C:
			s.reconcile()
		}
	}
}

func (s *FlowCronScheduler) stopCron() {
	s.mu.Lock()
	runner := s.cronRunner
	s.cronRunner = nil
	s.mu.Unlock()
	if runner != nil {
		runner.Stop()
	}
}

func (s *FlowCronScheduler) reconcile() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	flows, err := s.flows.List(ctx)
	if err != nil {
		s.logger.Error().Msgf("schedule: list flows failed: %v", err)
		return
	}

	desired := make(map[string]string)
	for _, flow := range flows {
		if strings.EqualFold(strings.TrimSpace(flow.Status), "archived") {
			continue
		}
		spec := extractCronSpec(flow.DefinitionJSON)
		if spec == "" {
			continue
		}
		desired[flow.ID] = spec
	}

	s.mu.Lock()
	unchanged := mapsEqualStringString(s.currentByFlow, desired)
	s.mu.Unlock()

	if unchanged {
		return
	}

	s.stopCron()

	runner := cron.NewWithLocation(time.Local)
	runner.ErrorLog = log.New(log.Writer(), "schedule: ", log.LstdFlags)

	for flowID, spec := range desired {
		schedule, err := parseCronSchedule(spec)
		if err != nil {
			s.logger.Error().Msgf("schedule: invalid cron for flow %s: %q: %v", flowID, spec, err)
			continue
		}
		id := flowID
		specCopy := spec
		runner.Schedule(schedule, cron.FuncJob(func() {
			s.startScheduledRun(id, specCopy)
		}))
	}

	runner.Start()

	s.mu.Lock()
	s.cronRunner = runner
	s.currentByFlow = desired
	s.mu.Unlock()
}

func (s *FlowCronScheduler) startScheduledRun(flowID string, spec string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	created, err := s.runs.Create(ctx, domain.Run{
		FlowID: flowID,
		Status: "queued",
		Log:    "queued (schedule)",
	})
	if err != nil {
		s.logger.Error().Msgf("schedule: create run failed (flow=%s spec=%q): %v", flowID, spec, err)
		return
	}

	if _, err := s.temporal.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        created.TemporalWorkflow,
		TaskQueue: TaskQueue,
	}, RunFlowWorkflow, RunFlowInput{FlowID: flowID, RunID: created.ID}); err != nil {
		_ = s.runs.UpdateStatus(context.Background(), created.ID, "failed", "failed to start workflow: "+err.Error())
		s.logger.Error().Msgf("schedule: start workflow failed (flow=%s run=%s): %v", flowID, created.ID, err)
		return
	}
}

func parseCronSchedule(spec string) (cron.Schedule, error) {
	raw := strings.TrimSpace(spec)
	if raw == "" {
		return nil, fmt.Errorf("empty schedule")
	}
	if strings.HasPrefix(raw, "@") {
		return cron.Parse(raw)
	}
	parts := strings.Fields(raw)
	if len(parts) == 5 {
		return cron.ParseStandard(raw)
	}
	if len(parts) == 6 {
		return cron.Parse(raw)
	}
	return cron.Parse(raw)
}

func extractCronSpec(definitionJSON string) string {
	type flowDef struct {
		Reactflow struct {
			Nodes []struct {
				Type string `json:"type"`
				Data struct {
					NodeType string         `json:"nodeType"`
					Config   map[string]any `json:"config"`
				} `json:"data"`
			} `json:"nodes"`
		} `json:"reactflow"`
	}

	var def flowDef
	if err := json.Unmarshal([]byte(definitionJSON), &def); err != nil {
		return ""
	}

	for _, node := range def.Reactflow.Nodes {
		nodeType := strings.TrimSpace(node.Data.NodeType)
		if nodeType == "" {
			nodeType = strings.TrimSpace(node.Type)
		}
		if nodeType != "cron" {
			continue
		}
		expr := strings.TrimSpace(readString(node.Data.Config, "expression"))
		if expr == "" {
			continue
		}
		return expr
	}
	return ""
}

func mapsEqualStringString(a, b map[string]string) bool {
	if len(a) != len(b) {
		return false
	}
	for k, v := range a {
		if b[k] != v {
			return false
		}
	}
	return true
}
