package temporal

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

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
				Source string `json:"source"`
				Target string `json:"target"`
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
	for _, e := range def.Reactflow.Edges {
		execEdges[e.Source] = append(execEdges[e.Source], edge{source: e.Source, target: e.Target, sourceHandle: e.SourceHandle})
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
		visited[nodeID] = struct{}{}
		executed++

		inputs := buildStepInputs(p.step.NodeType, p.config, runID, p.step.StepKey, input)
		inputsJSON, _ := json.Marshal(inputs)

		if err := a.steps.UpdateState(ctx, p.step.ID, "running", inputsJSON, nil, p.step.Name+" started", ""); err != nil {
			return err
		}

		outputs, logText, execErr := executeStep(ctx, p.step.NodeType, p.config, input)
		outputsJSON, _ := json.Marshal(outputs)

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

func sampleWebhookPayload() map[string]any {
	return map[string]any{"order_id": 10234, "total": 520.0, "currency": "USD"}
}

func buildStepInputs(nodeType string, config map[string]any, runID string, stepKey string, input map[string]any) map[string]any {
	now := time.Now().UTC().Format(time.RFC3339)
	inputs := map[string]any{
		"run_id":    runID,
		"step":      stepKey,
		"node_type": nodeType,
		"generated": now,
	}
	if input != nil {
		inputs["input"] = input
	}
	switch nodeType {
	case "httpRequest":
		method := strings.ToUpper(strings.TrimSpace(readString(config, "method")))
		if method == "" {
			method = http.MethodGet
		}
		rawURL := strings.TrimSpace(readString(config, "url"))
		queryParams := parseKeyValuePairsFromConfig(config, "queryParams")
		urlWithQuery := rawURL
		if computed, err := buildURLWithQuery(rawURL, queryParams); err == nil {
			urlWithQuery = computed
		}

		headers := parseStringMapFromConfig(config, "headers")
		body := readString(config, "body")

		inputs["url"] = urlWithQuery
		inputs["method"] = method
		if len(queryParams) > 0 {
			inputs["query"] = pairsToStringMap(queryParams)
		}
		if len(headers) > 0 {
			inputs["headers"] = headers
		}
		if strings.TrimSpace(body) != "" {
			inputs["body"] = parseJSONOrString(body)
		}
	case "cron":
		if expr := readString(config, "expression"); expr != "" {
			inputs["expression"] = expr
		}
	case "webhook":
		if path := readString(config, "path"); path != "" {
			inputs["path"] = path
		}
		inputs["payload"] = sampleWebhookPayload()
	case "httpTrigger":
		if path := readString(config, "path"); path != "" {
			inputs["path"] = path
		}
		if method := readString(config, "method"); method != "" {
			inputs["method"] = strings.ToUpper(strings.TrimSpace(method))
		}
	}
	return inputs
}

func executeStep(ctx context.Context, nodeType string, config map[string]any, input map[string]any) (map[string]any, string, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	switch nodeType {
	case "httpRequest":
		return executeHTTPRequest(ctx, config)
	case "cron":
		return simulateStep(ctx, map[string]any{"status": 200, "data": map[string]any{"scheduled_at": now}})
	case "webhook":
		return simulateStep(ctx, map[string]any{"status": 200, "data": sampleWebhookPayload()})
	case "if":
		return executeIf(ctx, config, input)
	default:
		return simulateStep(ctx, map[string]any{"status": 200, "data": map[string]any{"ok": true}})
	}
}

type ifCondition struct {
	Type     string
	Operator string
	Left     string
	Right    string
}

func executeIf(ctx context.Context, config map[string]any, input map[string]any) (map[string]any, string, error) {
	conds, combine, ignoreCase, convertTypes := parseIfConfig(config)
	if len(conds) == 0 {
		return map[string]any{"status": 200, "data": map[string]any{"result": true}}, "no conditions (default true)", nil
	}

	matched, err := evaluateIfConditions(conds, combine, ignoreCase, convertTypes, input)
	if err != nil {
		return map[string]any{"status": 0, "error": err.Error()}, "condition error", err
	}

	return map[string]any{
		"status": 200,
		"data": map[string]any{
			"result": matched,
		},
	}, fmt.Sprintf("result: %v", matched), nil
}

func parseIfConfig(config map[string]any) (conds []ifCondition, combine string, ignoreCase bool, convertTypes bool) {
	combine = "AND"
	if raw := strings.ToUpper(strings.TrimSpace(readString(config, "combine"))); raw == "OR" {
		combine = "OR"
	}
	ignoreCase = readBool(config, "ignoreCase")
	convertTypes = readBool(config, "convertTypes")

	rawConds, ok := config["conditions"]
	if !ok || rawConds == nil {
		return nil, combine, ignoreCase, convertTypes
	}
	arr, ok := rawConds.([]any)
	if !ok {
		return nil, combine, ignoreCase, convertTypes
	}

	out := make([]ifCondition, 0, len(arr))
	for _, item := range arr {
		m, ok := item.(map[string]any)
		if !ok {
			continue
		}
		out = append(out, ifCondition{
			Type:     strings.ToLower(strings.TrimSpace(readAnyString(m["type"]))),
			Operator: strings.TrimSpace(readAnyString(m["operator"])),
			Left:     strings.TrimSpace(readAnyString(m["left"])),
			Right:    strings.TrimSpace(readAnyString(m["right"])),
		})
	}
	return out, combine, ignoreCase, convertTypes
}

func evaluateIfConditions(conds []ifCondition, combine string, ignoreCase bool, convertTypes bool, input map[string]any) (bool, error) {
	if strings.EqualFold(combine, "OR") {
		for _, c := range conds {
			ok, err := evaluateIfCondition(c, ignoreCase, convertTypes, input)
			if err != nil {
				return false, err
			}
			if ok {
				return true, nil
			}
		}
		return false, nil
	}

	for _, c := range conds {
		ok, err := evaluateIfCondition(c, ignoreCase, convertTypes, input)
		if err != nil {
			return false, err
		}
		if !ok {
			return false, nil
		}
	}
	return true, nil
}

func evaluateIfCondition(c ifCondition, ignoreCase bool, convertTypes bool, input map[string]any) (bool, error) {
	typ := strings.ToLower(strings.TrimSpace(c.Type))
	if typ == "" {
		typ = "string"
	}
	op := strings.ToLower(strings.TrimSpace(c.Operator))
	if op == "" {
		op = "is equal to"
	}

	left := resolveLeftOperand(c.Left, input)
	right := resolveRightOperand(c.Right, input)

	switch typ {
	case "number":
		return evalNumber(op, left, right, convertTypes)
	case "datetime", "date", "date & time":
		return evalDatetime(op, left, right, convertTypes)
	case "boolean":
		return evalBoolean(op, left, right, convertTypes)
	case "array":
		return evalArray(op, left, right, convertTypes, ignoreCase)
	case "object":
		return evalObject(op, left)
	default:
		return evalString(op, left, right, ignoreCase)
	}
}

func resolveLeftOperand(raw string, input map[string]any) any {
	trim := strings.TrimSpace(raw)
	if trim == "" {
		return nil
	}
	if strings.HasPrefix(trim, "{{") && strings.HasSuffix(trim, "}}") {
		path := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(trim, "{{"), "}}"))
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if strings.EqualFold(trim, "input") {
		return input
	}
	if strings.HasPrefix(trim, "input.") {
		path := strings.TrimPrefix(trim, "input.")
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if v, ok := getByPath(input, trim); ok {
		return v
	}
	return nil
}

func resolveRightOperand(raw string, input map[string]any) any {
	trim := strings.TrimSpace(raw)
	if trim == "" {
		return nil
	}
	if strings.HasPrefix(trim, "{{") && strings.HasSuffix(trim, "}}") {
		path := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(trim, "{{"), "}}"))
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if strings.EqualFold(trim, "input") {
		return input
	}
	if strings.HasPrefix(trim, "input.") {
		path := strings.TrimPrefix(trim, "input.")
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	return trim
}

func evalString(op string, left any, right any, ignoreCase bool) (bool, error) {
	ls, lok := toString(left)
	rs, _ := toString(right)
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is empty":
		if !lok {
			return left == nil, nil
		}
		return strings.TrimSpace(ls) == "", nil
	case "is not empty":
		if !lok {
			return left != nil, nil
		}
		return strings.TrimSpace(ls) != "", nil
	}
	if ignoreCase {
		ls = strings.ToLower(ls)
		rs = strings.ToLower(rs)
	}
	switch op {
	case "is equal to":
		return ls == rs, nil
	case "is not equal to":
		return ls != rs, nil
	case "contains":
		return strings.Contains(ls, rs), nil
	case "does not contain":
		return !strings.Contains(ls, rs), nil
	case "starts with":
		return strings.HasPrefix(ls, rs), nil
	case "does not start with":
		return !strings.HasPrefix(ls, rs), nil
	case "ends with":
		return strings.HasSuffix(ls, rs), nil
	case "does not end with":
		return !strings.HasSuffix(ls, rs), nil
	case "matches regex":
		re, err := regexp.Compile(rs)
		if err != nil {
			return false, fmt.Errorf("invalid regex: %w", err)
		}
		return re.MatchString(ls), nil
	case "does not match regex":
		re, err := regexp.Compile(rs)
		if err != nil {
			return false, fmt.Errorf("invalid regex: %w", err)
		}
		return !re.MatchString(ls), nil
	default:
		return false, fmt.Errorf("unsupported string operator: %q", op)
	}
}

func evalNumber(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	lf, err := toFloat(left, convertTypes)
	if err != nil {
		return false, err
	}
	rf, err := toFloat(right, convertTypes)
	if err != nil {
		return false, err
	}

	switch op {
	case "is equal to":
		return lf == rf, nil
	case "is not equal to":
		return lf != rf, nil
	case "is greater than":
		return lf > rf, nil
	case "is less than":
		return lf < rf, nil
	case "is greater than or equal to":
		return lf >= rf, nil
	case "is less than or equal to":
		return lf <= rf, nil
	default:
		return false, fmt.Errorf("unsupported number operator: %q", op)
	}
}

func evalDatetime(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	lt, err := toTime(left, convertTypes)
	if err != nil {
		return false, err
	}
	rt, err := toTime(right, convertTypes)
	if err != nil {
		return false, err
	}

	switch op {
	case "is equal to":
		return lt.Equal(rt), nil
	case "is not equal to":
		return !lt.Equal(rt), nil
	case "is after":
		return lt.After(rt), nil
	case "is before":
		return lt.Before(rt), nil
	case "is after or equal to":
		return lt.After(rt) || lt.Equal(rt), nil
	case "is before or equal to":
		return lt.Before(rt) || lt.Equal(rt), nil
	default:
		return false, fmt.Errorf("unsupported datetime operator: %q", op)
	}
}

func evalBoolean(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is true":
		b, err := toBool(left, convertTypes)
		return b && err == nil, err
	case "is false":
		b, err := toBool(left, convertTypes)
		return !b && err == nil, err
	}

	lb, err := toBool(left, convertTypes)
	if err != nil {
		return false, err
	}
	rb, err := toBool(right, convertTypes)
	if err != nil {
		return false, err
	}
	switch op {
	case "is equal to":
		return lb == rb, nil
	case "is not equal to":
		return lb != rb, nil
	default:
		return false, fmt.Errorf("unsupported boolean operator: %q", op)
	}
}

func evalArray(op string, left any, right any, convertTypes bool, ignoreCase bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	arr, err := toSlice(left, convertTypes)
	if err != nil {
		return false, err
	}
	switch op {
	case "is empty":
		return len(arr) == 0, nil
	case "is not empty":
		return len(arr) > 0, nil
	}

	if strings.HasPrefix(op, "length ") {
		rn, err := toInt(right, convertTypes)
		if err != nil {
			return false, err
		}
		switch op {
		case "length equal to":
			return len(arr) == rn, nil
		case "length not equal to":
			return len(arr) != rn, nil
		case "length greater than":
			return len(arr) > rn, nil
		case "length less than":
			return len(arr) < rn, nil
		case "length greater than or equal to":
			return len(arr) >= rn, nil
		case "length less than or equal to":
			return len(arr) <= rn, nil
		default:
			return false, fmt.Errorf("unsupported array operator: %q", op)
		}
	}

	rs, _ := toString(right)
	if ignoreCase {
		rs = strings.ToLower(rs)
	}

	contains := false
	for _, item := range arr {
		ls, _ := toString(item)
		if ignoreCase {
			ls = strings.ToLower(ls)
		}
		if ls == rs {
			contains = true
			break
		}
	}

	switch op {
	case "contains":
		return contains, nil
	case "does not contain":
		return !contains, nil
	default:
		return false, fmt.Errorf("unsupported array operator: %q", op)
	}
}

func evalObject(op string, left any) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is empty":
		m, ok := left.(map[string]any)
		if !ok {
			return left == nil, nil
		}
		return len(m) == 0, nil
	case "is not empty":
		m, ok := left.(map[string]any)
		if !ok {
			return left != nil, nil
		}
		return len(m) > 0, nil
	default:
		return false, fmt.Errorf("unsupported object operator: %q", op)
	}
}

func toString(v any) (string, bool) {
	if v == nil {
		return "", false
	}
	switch t := v.(type) {
	case string:
		return t, true
	case []byte:
		return string(t), true
	default:
		return fmt.Sprint(v), true
	}
}

func toFloat(v any, convertTypes bool) (float64, error) {
	if v == nil {
		return 0, fmt.Errorf("missing number")
	}
	switch t := v.(type) {
	case float64:
		return t, nil
	case float32:
		return float64(t), nil
	case int:
		return float64(t), nil
	case int64:
		return float64(t), nil
	case json.Number:
		return t.Float64()
	case string:
		if !convertTypes {
			return 0, fmt.Errorf("expected number, got string")
		}
		return strconv.ParseFloat(strings.TrimSpace(t), 64)
	default:
		if !convertTypes {
			return 0, fmt.Errorf("expected number, got %T", v)
		}
		return strconv.ParseFloat(strings.TrimSpace(fmt.Sprint(v)), 64)
	}
}

func toInt(v any, convertTypes bool) (int, error) {
	f, err := toFloat(v, convertTypes)
	if err != nil {
		return 0, err
	}
	return int(f), nil
}

func toBool(v any, convertTypes bool) (bool, error) {
	if v == nil {
		return false, fmt.Errorf("missing boolean")
	}
	switch t := v.(type) {
	case bool:
		return t, nil
	case string:
		if !convertTypes {
			return false, fmt.Errorf("expected boolean, got string")
		}
		switch strings.ToLower(strings.TrimSpace(t)) {
		case "true", "1", "yes", "y", "on":
			return true, nil
		case "false", "0", "no", "n", "off":
			return false, nil
		default:
			return false, fmt.Errorf("invalid boolean %q", t)
		}
	default:
		if !convertTypes {
			return false, fmt.Errorf("expected boolean, got %T", v)
		}
		return toBool(fmt.Sprint(v), true)
	}
}

func toTime(v any, convertTypes bool) (time.Time, error) {
	if v == nil {
		return time.Time{}, fmt.Errorf("missing datetime")
	}
	switch t := v.(type) {
	case time.Time:
		return t, nil
	case string:
		s := strings.TrimSpace(t)
		if s == "" {
			return time.Time{}, fmt.Errorf("missing datetime")
		}
		if parsed, err := time.Parse(time.RFC3339Nano, s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse(time.RFC3339, s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02 15:04:05", s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02 15:04", s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02", s); err == nil {
			return parsed, nil
		}
		if convertTypes {
			if num, err := strconv.ParseInt(s, 10, 64); err == nil {
				return time.Unix(num, 0).UTC(), nil
			}
		}
		return time.Time{}, fmt.Errorf("invalid datetime %q", s)
	default:
		if !convertTypes {
			return time.Time{}, fmt.Errorf("expected datetime, got %T", v)
		}
		return toTime(fmt.Sprint(v), true)
	}
}

func toSlice(v any, convertTypes bool) ([]any, error) {
	if v == nil {
		return nil, fmt.Errorf("missing array")
	}
	switch t := v.(type) {
	case []any:
		return t, nil
	case []string:
		out := make([]any, 0, len(t))
		for _, s := range t {
			out = append(out, s)
		}
		return out, nil
	case string:
		if !convertTypes {
			return nil, fmt.Errorf("expected array, got string")
		}
		var out []any
		if err := json.Unmarshal([]byte(strings.TrimSpace(t)), &out); err != nil {
			return nil, fmt.Errorf("invalid array json: %w", err)
		}
		return out, nil
	default:
		return nil, fmt.Errorf("expected array, got %T", v)
	}
}

func readBool(cfg map[string]any, key string) bool {
	if cfg == nil {
		return false
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return false
	}
	if v, ok := raw.(bool); ok {
		return v
	}
	if s, ok := raw.(string); ok {
		switch strings.ToLower(strings.TrimSpace(s)) {
		case "true", "1", "yes", "y", "on":
			return true
		default:
			return false
		}
	}
	return false
}

func readNestedBool(root map[string]any, keys ...string) bool {
	var cur any = root
	for _, k := range keys {
		m, ok := cur.(map[string]any)
		if !ok {
			return false
		}
		cur = m[k]
	}
	b, ok := cur.(bool)
	if ok {
		return b
	}
	if s, ok := cur.(string); ok {
		return strings.EqualFold(strings.TrimSpace(s), "true")
	}
	return false
}

func getByPath(root map[string]any, path string) (any, bool) {
	if root == nil {
		return nil, false
	}
	if strings.TrimSpace(path) == "" {
		return root, true
	}
	parts := strings.Split(path, ".")
	var cur any = root
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		m, ok := cur.(map[string]any)
		if !ok {
			return nil, false
		}
		v, ok := m[p]
		if !ok {
			return nil, false
		}
		cur = v
	}
	return cur, true
}

func simulateStep(ctx context.Context, outputs map[string]any) (map[string]any, string, error) {
	wait := time.Duration(150+rand.Intn(650)) * time.Millisecond
	select {
	case <-ctx.Done():
		return outputs, "canceled", ctx.Err()
	case <-time.After(wait):
		return outputs, "success", nil
	}
}

func executeHTTPRequest(ctx context.Context, config map[string]any) (map[string]any, string, error) {
	method := strings.ToUpper(strings.TrimSpace(readString(config, "method")))
	if method == "" {
		method = http.MethodGet
	}

	rawURL := strings.TrimSpace(readString(config, "url"))
	if rawURL == "" {
		return map[string]any{"status": 0}, "missing url", fmt.Errorf("httpRequest: url is required")
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return map[string]any{"status": 0}, "invalid url", fmt.Errorf("httpRequest: invalid url: %w", err)
	}
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return map[string]any{"status": 0}, "unsupported scheme", fmt.Errorf("httpRequest: only http/https urls are allowed")
	}

	queryParams := parseKeyValuePairsFromConfig(config, "queryParams")
	if len(queryParams) > 0 {
		q := parsedURL.Query()
		for _, p := range queryParams {
			k := strings.TrimSpace(p.Key)
			if k == "" {
				continue
			}
			q.Set(k, p.Value)
		}
		parsedURL.RawQuery = q.Encode()
	}
	finalURL := parsedURL.String()

	headers := parseStringMapFromConfig(config, "headers")
	body := readString(config, "body")

	var bodyReader io.Reader
	if strings.TrimSpace(body) != "" && method != http.MethodGet && method != http.MethodHead {
		bodyReader = bytes.NewReader([]byte(body))
	}

	req, err := http.NewRequestWithContext(ctx, method, finalURL, bodyReader)
	if err != nil {
		return map[string]any{"status": 0}, "request build failed", fmt.Errorf("httpRequest: %w", err)
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}
	if bodyReader != nil && req.Header.Get("Content-Type") == "" {
		trim := strings.TrimSpace(body)
		if strings.HasPrefix(trim, "{") || strings.HasPrefix(trim, "[") {
			req.Header.Set("Content-Type", "application/json")
		} else {
			req.Header.Set("Content-Type", "text/plain; charset=utf-8")
		}
	}
	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", "FlowCraft/0.1")
	}

	client := &http.Client{Timeout: 12 * time.Second}
	started := time.Now()
	res, err := client.Do(req)
	duration := time.Since(started)
	if err != nil {
		return map[string]any{"status": 0, "error": err.Error()}, "request failed", err
	}
	defer res.Body.Close()

	const maxBodyBytes = 512 * 1024
	bodyBytes, _ := io.ReadAll(io.LimitReader(res.Body, maxBodyBytes))

	parsedBody := parseJSONOrString(string(bodyBytes))
	outputs := map[string]any{
		"status": res.StatusCode,
		"data":   parsedBody,
		"meta": map[string]any{
			"duration_ms":  duration.Milliseconds(),
			"content_type": res.Header.Get("Content-Type"),
		},
	}

	logText := fmt.Sprintf("%s %s -> %d (%dms)", method, finalURL, res.StatusCode, duration.Milliseconds())
	if res.StatusCode >= 400 {
		return outputs, logText, fmt.Errorf("httpRequest: received HTTP %d", res.StatusCode)
	}
	return outputs, logText, nil
}

type keyValuePair struct {
	Key   string
	Value string
}

func buildURLWithQuery(rawURL string, params []keyValuePair) (string, error) {
	if len(params) == 0 {
		return rawURL, nil
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL, err
	}
	q := u.Query()
	for _, p := range params {
		k := strings.TrimSpace(p.Key)
		if k == "" {
			continue
		}
		q.Set(k, p.Value)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func pairsToStringMap(pairs []keyValuePair) map[string]string {
	if len(pairs) == 0 {
		return nil
	}
	out := make(map[string]string, len(pairs))
	for _, p := range pairs {
		k := strings.TrimSpace(p.Key)
		if k == "" {
			continue
		}
		out[k] = p.Value
	}
	return out
}

func parseKeyValuePairsFromConfig(cfg map[string]any, key string) []keyValuePair {
	if cfg == nil {
		return nil
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return nil
	}

	switch v := raw.(type) {
	case []any:
		out := make([]keyValuePair, 0, len(v))
		for _, item := range v {
			m, ok := item.(map[string]any)
			if !ok {
				if m2, ok := item.(map[string]string); ok {
					k := strings.TrimSpace(m2["key"])
					val := m2["value"]
					out = append(out, keyValuePair{Key: k, Value: val})
				}
				continue
			}
			k := strings.TrimSpace(readAnyString(m["key"]))
			val := readAnyString(m["value"])
			out = append(out, keyValuePair{Key: k, Value: val})
		}
		return out
	case map[string]any:
		out := make([]keyValuePair, 0, len(v))
		for k, val := range v {
			out = append(out, keyValuePair{Key: k, Value: readAnyString(val)})
		}
		return out
	case map[string]string:
		out := make([]keyValuePair, 0, len(v))
		for k, val := range v {
			out = append(out, keyValuePair{Key: k, Value: val})
		}
		return out
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" || trim == "{}" || trim == "[]" {
			return nil
		}
		var parsed any
		if err := json.Unmarshal([]byte(trim), &parsed); err != nil {
			return nil
		}
		return parseKeyValuePairsFromConfig(map[string]any{key: parsed}, key)
	default:
		return nil
	}
}

func parseStringMapFromConfig(cfg map[string]any, key string) map[string]string {
	if cfg == nil {
		return nil
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return nil
	}

	switch v := raw.(type) {
	case map[string]any:
		out := make(map[string]string, len(v))
		for k, val := range v {
			out[k] = readAnyString(val)
		}
		return out
	case map[string]string:
		out := make(map[string]string, len(v))
		for k, val := range v {
			out[k] = val
		}
		return out
	case []any:
		pairs := parseKeyValuePairsFromConfig(map[string]any{key: v}, key)
		return pairsToStringMap(pairs)
	case string:
		return parseJSONStringMap(v)
	default:
		return parseJSONStringMap(fmt.Sprint(v))
	}
}

func parseJSONStringMap(raw string) map[string]string {
	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "{}" {
		return nil
	}

	var obj map[string]any
	if err := json.Unmarshal([]byte(raw), &obj); err != nil {
		return nil
	}

	out := make(map[string]string, len(obj))
	for k, v := range obj {
		out[k] = readAnyString(v)
	}
	return out
}

func readAnyString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}

func readString(cfg map[string]any, key string) string {
	if cfg == nil {
		return ""
	}
	v, ok := cfg[key]
	if !ok || v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}

func parseJSONOrString(v string) any {
	trim := strings.TrimSpace(v)
	if trim == "" {
		return ""
	}

	var out any
	if err := json.Unmarshal([]byte(trim), &out); err == nil {
		return out
	}
	return v
}

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
