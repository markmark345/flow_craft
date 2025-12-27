package temporal

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

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
	case "errorTrigger":
		if input != nil {
			inputs["payload"] = input
		}
	case "gmail":
		inputs["credential_id"] = readString(config, "credentialId")
		if to := readString(config, "to"); to != "" {
			inputs["to"] = to
		}
		if subject := readString(config, "subject"); subject != "" {
			inputs["subject"] = subject
		}
	case "gsheets":
		inputs["credential_id"] = readString(config, "credentialId")
		if spreadsheetID := readString(config, "spreadsheetId"); spreadsheetID != "" {
			inputs["spreadsheet_id"] = spreadsheetID
		}
		if sheetName := readString(config, "sheetName"); sheetName != "" {
			inputs["sheet_name"] = sheetName
		}
	case "github":
		inputs["credential_id"] = readString(config, "credentialId")
		if owner := readString(config, "owner"); owner != "" {
			inputs["owner"] = owner
		}
		if repo := readString(config, "repo"); repo != "" {
			inputs["repo"] = repo
		}
	case "app":
		inputs["app"] = readString(config, "app")
		inputs["action"] = readString(config, "action")
		inputs["credential_id"] = readString(config, "credentialId")
	}
	return inputs
}

func executeStep(
	ctx context.Context,
	nodeType string,
	config map[string]any,
	input map[string]any,
	steps map[string]any,
	deps stepDependencies,
) (map[string]any, string, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	switch nodeType {
	case "httpRequest":
		return executeHTTPRequest(ctx, config)
	case "cron":
		return simulateStep(ctx, map[string]any{"status": 200, "data": map[string]any{"scheduled_at": now}})
	case "webhook":
		return simulateStep(ctx, map[string]any{"status": 200, "data": sampleWebhookPayload()})
	case "if":
		return executeIf(ctx, config, input, steps)
	case "errorTrigger":
		return simulateStep(ctx, map[string]any{"status": 200, "data": input})
	case "merge":
		return executeMerge(ctx, input, steps)
	case "gmail":
		return executeGmail(ctx, config, deps)
	case "gsheets":
		return executeSheets(ctx, config, deps)
	case "github":
		return executeGitHub(ctx, config, deps)
	case "app":
		return executeApp(ctx, config, deps)
	default:
		return simulateStep(ctx, map[string]any{"status": 200, "data": map[string]any{"ok": true}})
	}
}

func executeIf(_ context.Context, config map[string]any, input map[string]any, steps map[string]any) (map[string]any, string, error) {
	conds, combine, ignoreCase, convertTypes := parseIfConfig(config)
	if len(conds) == 0 {
		return map[string]any{"status": 200, "data": map[string]any{"result": true}}, "no conditions (default true)", nil
	}

	ctxInput := buildIfContext(input, steps)
	matched, err := evaluateIfConditions(conds, combine, ignoreCase, convertTypes, ctxInput)
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

func executeMerge(_ context.Context, input map[string]any, steps map[string]any) (map[string]any, string, error) {
	if steps == nil {
		steps = map[string]any{}
	}
	stepsSnapshot := make(map[string]any, len(steps))
	for k, v := range steps {
		stepsSnapshot[k] = v
	}
	return map[string]any{
		"status": 200,
		"data": map[string]any{
			"input": input,
			"steps": stepsSnapshot,
		},
	}, "merged steps", nil
}

func mergeInputsReady(nodeID string, incomingByTarget map[string][]string, visited map[string]struct{}) bool {
	if nodeID == "" {
		return true
	}
	if incomingByTarget == nil || visited == nil {
		return true
	}
	sources := incomingByTarget[nodeID]
	if len(sources) == 0 {
		return true
	}
	for _, source := range sources {
		if source == "" {
			continue
		}
		if _, ok := visited[source]; !ok {
			return false
		}
	}
	return true
}

func buildIfContext(input map[string]any, steps map[string]any) map[string]any {
	ctxInput := map[string]any{}
	for k, v := range input {
		ctxInput[k] = v
	}
	if steps != nil {
		ctxInput["steps"] = steps
	}
	return ctxInput
}

func storeStepOutput(store map[string]any, nodeID string, outputs map[string]any) {
	if store == nil || nodeID == "" || outputs == nil {
		return
	}
	store[nodeID] = outputs
	shortKey := shortNodeKey(nodeID)
	if shortKey != "" {
		if _, exists := store[shortKey]; !exists {
			store[shortKey] = outputs
		}
	}
}

func shortNodeKey(nodeID string) string {
	if nodeID == "" {
		return ""
	}
	short := nodeID
	if len(short) > 5 {
		short = short[:5]
	}
	return "node_" + short
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
