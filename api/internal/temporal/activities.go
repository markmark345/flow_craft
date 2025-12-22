package temporal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/google/uuid"
	"go.temporal.io/sdk/activity"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/repositories"
)

type Activities struct {
	flows *repositories.FlowRepository
	runs  *repositories.RunRepository
	steps *repositories.RunStepRepository
}

func NewActivities(flows *repositories.FlowRepository, runs *repositories.RunRepository, steps *repositories.RunStepRepository) *Activities {
	return &Activities{flows: flows, runs: runs, steps: steps}
}

func (a *Activities) LoadFlowDefinitionActivity(ctx context.Context, flowID string) (string, error) {
	flow, err := a.flows.Get(ctx, flowID)
	if err != nil {
		return "", err
	}
	return flow.DefinitionJSON, nil
}

func (a *Activities) ExecuteNodeActivity(ctx context.Context, runID string, definitionJSON string) (string, error) {
	log := activity.GetLogger(ctx)

	type flowDef struct {
		Reactflow struct {
			Nodes []struct {
				ID       string `json:"id"`
				Type     string `json:"type"`
				Position struct {
					X float64 `json:"x"`
					Y float64 `json:"y"`
				} `json:"position"`
				Data struct {
					NodeType string         `json:"nodeType"`
					Label    string         `json:"label"`
					Config   map[string]any `json:"config"`
				} `json:"data"`
			} `json:"nodes"`
			Edges []struct {
				ID           string `json:"id"`
				Source       string `json:"source"`
				Target       string `json:"target"`
				SourceHandle string `json:"sourceHandle"`
				TargetHandle string `json:"targetHandle"`
			} `json:"edges"`
		} `json:"reactflow"`
	}

	var def flowDef
	if err := json.Unmarshal([]byte(definitionJSON), &def); err != nil {
		return "", fmt.Errorf("invalid flow definition: %w", err)
	}

	nodeCount := len(def.Reactflow.Nodes)
	log.Info("executing flow", "runID", runID, "nodes", nodeCount)

	type edge struct {
		source       string
		target       string
		sourceHandle string
	}

	nodeIndexByID := make(map[string]int, nodeCount)
	for idx, n := range def.Reactflow.Nodes {
		nodeIndexByID[n.ID] = idx
	}

	orderedIDs := make([]string, 0, nodeCount)
	rootIDs := make([]string, 0, nodeCount)
	if nodeCount > 0 {
		isTrigger := func(nodeType string) bool {
			switch nodeType {
			case "cron", "webhook", "httpTrigger", "trigger":
				return true
			default:
				return false
			}
		}

		indegree := make(map[string]int, nodeCount)
		adj := make(map[string][]string, nodeCount)
		for _, n := range def.Reactflow.Nodes {
			indegree[n.ID] = 0
		}
		for _, e := range def.Reactflow.Edges {
			if _, ok := nodeIndexByID[e.Source]; !ok {
				continue
			}
			if _, ok := nodeIndexByID[e.Target]; !ok {
				continue
			}
			adj[e.Source] = append(adj[e.Source], e.Target)
			indegree[e.Target]++
		}

		sortQueue := func(ids []string) {
			sort.Slice(ids, func(i, j int) bool {
				aID := ids[i]
				bID := ids[j]
				aIdx := nodeIndexByID[aID]
				bIdx := nodeIndexByID[bID]
				aNode := def.Reactflow.Nodes[aIdx]
				bNode := def.Reactflow.Nodes[bIdx]

				aType := strings.TrimSpace(aNode.Data.NodeType)
				if aType == "" {
					aType = strings.TrimSpace(aNode.Type)
				}
				bType := strings.TrimSpace(bNode.Data.NodeType)
				if bType == "" {
					bType = strings.TrimSpace(bNode.Type)
				}

				aRank := 1
				bRank := 1
				if isTrigger(aType) {
					aRank = 0
				}
				if isTrigger(bType) {
					bRank = 0
				}
				if aRank != bRank {
					return aRank < bRank
				}
				if aNode.Position.X != bNode.Position.X {
					return aNode.Position.X < bNode.Position.X
				}
				if aNode.Position.Y != bNode.Position.Y {
					return aNode.Position.Y < bNode.Position.Y
				}
				return aIdx < bIdx
			})
		}

		for _, n := range def.Reactflow.Nodes {
			if indegree[n.ID] == 0 {
				rootIDs = append(rootIDs, n.ID)
			}
		}
		sortQueue(rootIDs)

		queue := make([]string, 0, nodeCount)
		for _, n := range def.Reactflow.Nodes {
			if indegree[n.ID] == 0 {
				queue = append(queue, n.ID)
			}
		}
		sortQueue(queue)

		seen := make(map[string]struct{}, nodeCount)
		for len(queue) > 0 {
			id := queue[0]
			queue = queue[1:]
			if _, ok := seen[id]; ok {
				continue
			}
			seen[id] = struct{}{}
			orderedIDs = append(orderedIDs, id)
			for _, t := range adj[id] {
				indegree[t]--
				if indegree[t] == 0 {
					queue = append(queue, t)
					sortQueue(queue)
				}
			}
		}

		if len(orderedIDs) < nodeCount {
			rest := make([]string, 0, nodeCount-len(orderedIDs))
			for _, n := range def.Reactflow.Nodes {
				if _, ok := seen[n.ID]; ok {
					continue
				}
				rest = append(rest, n.ID)
			}
			sortQueue(rest)
			orderedIDs = append(orderedIDs, rest...)
		}
	}

	type plannedStep struct {
		step   entities.RunStep
		config map[string]any
	}

	planned := make([]plannedStep, 0, maxInt(1, nodeCount))
	if nodeCount == 0 {
		planned = append(planned, plannedStep{
			step: entities.RunStep{
				ID:       deterministicStepID(runID, "STEP_01"),
				RunID:    runID,
				StepKey:  "STEP_01",
				Name:     "Trigger: Manual",
				Status:   "queued",
				NodeType: "trigger",
			},
		})
	} else {
		for idx, nodeID := range orderedIDs {
			node := def.Reactflow.Nodes[nodeIndexByID[nodeID]]
			stepKey := fmt.Sprintf("STEP_%02d", idx+1)
			name := strings.TrimSpace(node.Data.Label)
			if name == "" {
				name = strings.TrimSpace(node.Data.NodeType)
			}
			if name == "" {
				name = "Step " + stepKey
			}

			nodeType := strings.TrimSpace(node.Data.NodeType)
			if nodeType == "" {
				nodeType = strings.TrimSpace(node.Type)
			}

			planned = append(planned, plannedStep{
				step: entities.RunStep{
					ID:       deterministicStepID(runID, stepKey),
					RunID:    runID,
					StepKey:  stepKey,
					Name:     name,
					Status:   "queued",
					NodeID:   node.ID,
					NodeType: nodeType,
				},
				config: node.Data.Config,
			})
		}
	}

	steps := make([]entities.RunStep, 0, len(planned))
	for _, p := range planned {
		steps = append(steps, p.step)
	}

	if err := a.steps.CreateMany(ctx, steps); err != nil {
		return "", err
	}

	plannedByNodeID := make(map[string]plannedStep, len(planned))
	for _, p := range planned {
		if p.step.NodeID == "" {
			continue
		}
		plannedByNodeID[p.step.NodeID] = p
	}

	execEdges := make(map[string][]edge, nodeCount)
	incomingByTarget := make(map[string][]string, nodeCount)
	for _, e := range def.Reactflow.Edges {
		execEdges[e.Source] = append(execEdges[e.Source], edge{source: e.Source, target: e.Target, sourceHandle: e.SourceHandle})
		if _, ok := nodeIndexByID[e.Source]; ok {
			if _, ok := nodeIndexByID[e.Target]; ok {
				incomingByTarget[e.Target] = append(incomingByTarget[e.Target], e.Source)
			}
		}
	}
	for source := range execEdges {
		sort.Slice(execEdges[source], func(i, j int) bool {
			return nodeIndexByID[execEdges[source][i].target] < nodeIndexByID[execEdges[source][j].target]
		})
	}

	triggers := make([]string, 0, nodeCount)
	for _, node := range def.Reactflow.Nodes {
		nodeType := strings.TrimSpace(node.Data.NodeType)
		if nodeType == "" {
			nodeType = strings.TrimSpace(node.Type)
		}
		switch nodeType {
		case "cron", "webhook", "httpTrigger", "trigger":
			triggers = append(triggers, node.ID)
		}
	}
	sort.Slice(triggers, func(i, j int) bool { return nodeIndexByID[triggers[i]] < nodeIndexByID[triggers[j]] })

	startIDs := triggers
	if len(startIDs) == 0 {
		startIDs = rootIDs
	}
	if len(startIDs) == 0 && len(orderedIDs) > 0 {
		startIDs = []string{orderedIDs[0]}
	}

	visited := make(map[string]struct{}, nodeCount)
	executed := 0
	failedButContinued := 0
	outputsByNodeID := make(map[string]any, nodeCount*2)

	var executeNode func(nodeID string, input map[string]any) error
	executeNode = func(nodeID string, input map[string]any) error {
		if nodeID == "" {
			return nil
		}
		if _, ok := visited[nodeID]; ok {
			return nil
		}
		p, ok := plannedByNodeID[nodeID]
		if !ok {
			return nil
		}
		if p.step.NodeType == "merge" && !mergeInputsReady(nodeID, incomingByTarget, visited) {
			return nil
		}

		visited[nodeID] = struct{}{}
		executed++

		inputs := buildStepInputs(p.step.NodeType, p.config, runID, p.step.StepKey, input)
		inputsJSON, _ := json.Marshal(inputs)

		if err := a.steps.UpdateState(ctx, p.step.ID, "running", inputsJSON, nil, p.step.Name+" started", ""); err != nil {
			return err
		}

		outputs, logText, execErr := executeStep(ctx, p.step.NodeType, p.config, input, outputsByNodeID)
		outputsJSON, _ := json.Marshal(outputs)

		if p.step.NodeID != "" {
			storeStepOutput(outputsByNodeID, p.step.NodeID, outputs)
		}

		continueOnFail := false
		if raw, ok := p.config["continueOnFail"]; ok {
			if v, ok := raw.(bool); ok {
				continueOnFail = v
			} else if s, ok := raw.(string); ok {
				continueOnFail = strings.EqualFold(strings.TrimSpace(s), "true")
			}
		}

		if execErr != nil {
			if errors.Is(execErr, context.Canceled) || errors.Is(execErr, context.DeadlineExceeded) {
				_ = a.steps.UpdateState(context.WithoutCancel(ctx), p.step.ID, "canceled", inputsJSON, outputsJSON, "canceled", "canceled by user")
				return execErr
			}
			_ = a.steps.UpdateState(ctx, p.step.ID, "failed", inputsJSON, outputsJSON, logText, execErr.Error())
			if !continueOnFail {
				return execErr
			}
			failedButContinued++
		} else {
			if err := a.steps.UpdateState(ctx, p.step.ID, "success", inputsJSON, outputsJSON, logText, ""); err != nil {
				return err
			}
		}

		nextInput := outputs
		nextEdges := execEdges[nodeID]
		if p.step.NodeType == "if" {
			matched := readNestedBool(outputs, "data", "result")
			handle := "false"
			if matched {
				handle = "true"
			}
			filtered := make([]edge, 0, len(nextEdges))
			for _, e := range nextEdges {
				if e.sourceHandle == handle {
					filtered = append(filtered, e)
					continue
				}
				if handle == "true" && strings.TrimSpace(e.sourceHandle) == "" {
					filtered = append(filtered, e)
				}
			}
			nextEdges = filtered
		}

		for _, e := range nextEdges {
			if err := executeNode(e.target, nextInput); err != nil {
				return err
			}
		}
		return nil
	}

	for _, id := range startIDs {
		if err := executeNode(id, nil); err != nil {
			return "", err
		}
	}

	skipped := 0
	for _, p := range planned {
		if p.step.NodeID == "" {
			continue
		}
		if _, ok := visited[p.step.NodeID]; ok {
			continue
		}
		skipped++
		_ = a.steps.UpdateState(ctx, p.step.ID, "skipped", nil, nil, "skipped", "")
	}

	if failedButContinued > 0 {
		return fmt.Sprintf("executed %d nodes (%d failed, continued; %d skipped)", executed, failedButContinued, skipped), nil
	}
	return fmt.Sprintf("executed %d nodes (%d skipped)", executed, skipped), nil
}

func (a *Activities) UpdateRunStatusActivity(ctx context.Context, runID string, status string, logText string) error {
	activity.GetLogger(ctx).Info("updating run", "runID", runID, "status", status)
	return a.runs.UpdateStatus(ctx, runID, status, logText)
}

func deterministicStepID(runID string, stepKey string) string {
	return uuid.NewSHA1(uuid.NameSpaceURL, []byte(runID+":"+stepKey)).String()
}
