package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/connectors/github"
	"flowcraft-api/internal/connectors/google"
)

func executeGmail(ctx context.Context, config map[string]any, deps stepDependencies) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("gmail: credentialId is required")
	}
	to := strings.TrimSpace(readString(config, "to"))
	if to == "" {
		return map[string]any{"status": 0}, "missing recipient", errors.New("gmail: to is required")
	}
	subject := strings.TrimSpace(readString(config, "subject"))
	bodyText := readString(config, "bodyText")
	bodyHTML := readString(config, "bodyHtml")
	from := strings.TrimSpace(readString(config, "from"))

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "google" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("gmail: expected google credential")
	}
	accessToken, err := googleAccessToken(ctx, deps, payload)
	if err != nil {
		return map[string]any{"status": 0}, "token refresh failed", err
	}
	if from == "" {
		from = strings.TrimSpace(readAnyString(payload["account_email"]))
	}

	started := time.Now()
	out, err := google.SendEmail(ctx, accessToken, from, to, subject, bodyText, bodyHTML)
	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "gmail send failed", err
	}
	logText := fmt.Sprintf("gmail send -> %s (%dms)", to, duration.Milliseconds())
	return outputs, logText, nil
}

func executeSheets(ctx context.Context, config map[string]any, deps stepDependencies) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("gsheets: credentialId is required")
	}
	spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
	if spreadsheetID == "" {
		return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets: spreadsheetId is required")
	}
	sheetName := strings.TrimSpace(readString(config, "sheetName"))

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "google" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("gsheets: expected google credential")
	}
	accessToken, err := googleAccessToken(ctx, deps, payload)
	if err != nil {
		return map[string]any{"status": 0}, "token refresh failed", err
	}
	values, err := parseSheetValues(config)
	if err != nil {
		return map[string]any{"status": 0}, "invalid values", err
	}

	started := time.Now()
	out, err := google.AppendRow(ctx, accessToken, spreadsheetID, sheetName, values)
	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "sheets append failed", err
	}
	logText := fmt.Sprintf("gsheets append -> %s (%dms)", spreadsheetID, duration.Milliseconds())
	return outputs, logText, nil
}

func executeGitHub(ctx context.Context, config map[string]any, deps stepDependencies) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("github: credentialId is required")
	}
	owner := strings.TrimSpace(readString(config, "owner"))
	repo := strings.TrimSpace(readString(config, "repo"))
	title := strings.TrimSpace(readString(config, "title"))
	body := readString(config, "body")
	if owner == "" || repo == "" || title == "" {
		return map[string]any{"status": 0}, "missing fields", errors.New("github: owner, repo, and title are required")
	}

	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "github" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("github: expected github credential")
	}
	accessToken := strings.TrimSpace(readAnyString(payload["access_token"]))
	if accessToken == "" {
		return map[string]any{"status": 0}, "missing token", errors.New("github: access token missing")
	}

	started := time.Now()
	out, err := github.CreateIssue(ctx, accessToken, owner, repo, title, body)
	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "github issue failed", err
	}
	logText := fmt.Sprintf("github issue -> %s/%s (%dms)", owner, repo, duration.Milliseconds())
	return outputs, logText, nil
}

func executeApp(ctx context.Context, config map[string]any, deps stepDependencies) (map[string]any, string, error) {
	app := strings.TrimSpace(readString(config, "app"))
	action := strings.TrimSpace(readString(config, "action"))
	if app == "" && action != "" {
		switch {
		case strings.HasPrefix(strings.ToLower(action), "gmail."):
			app = "gmail"
		case strings.HasPrefix(strings.ToLower(action), "gsheets."):
			app = "googleSheets"
		case strings.HasPrefix(strings.ToLower(action), "github."):
			app = "github"
		}
	}

	switch strings.ToLower(app) {
	case "gmail":
		if action == "" {
			action = "gmail.sendEmail"
		}
		if strings.EqualFold(action, "gmail.sendEmail") {
			return executeGmail(ctx, config, deps)
		}
		return map[string]any{"status": 0}, "unsupported gmail action", fmt.Errorf("app(gmail): unsupported action %q", action)
	case "googlesheets", "google_sheets", "sheets", "gsheets":
		if action == "" {
			action = "gsheets.appendRow"
		}
		return executeAppSheets(ctx, config, deps, action)
	case "github":
		if action == "" {
			action = "github.createIssue"
		}
		return executeAppGitHub(ctx, config, deps, action)
	default:
		return map[string]any{"status": 0}, "unsupported app", fmt.Errorf("app: unsupported app %q", app)
	}
}

func executeAppSheets(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("gsheets: credentialId is required")
	}
	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "google" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("gsheets: expected google credential")
	}
	accessToken, err := googleAccessToken(ctx, deps, payload)
	if err != nil {
		return map[string]any{"status": 0}, "token refresh failed", err
	}

	started := time.Now()
	var out map[string]any
	switch strings.ToLower(strings.TrimSpace(action)) {
	case "gsheets.createspreadsheet":
		title := strings.TrimSpace(readString(config, "title"))
		if title == "" {
			return map[string]any{"status": 0}, "missing title", errors.New("gsheets.createSpreadsheet: title is required")
		}
		sheetName := strings.TrimSpace(readString(config, "sheetName"))
		out, err = google.CreateSpreadsheet(ctx, accessToken, title, sheetName)
	case "gsheets.deletespreadsheet":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.deleteSpreadsheet: spreadsheetId is required")
		}
		out, err = google.DeleteSpreadsheet(ctx, accessToken, spreadsheetID)
	case "gsheets.appendrow":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.appendRow: spreadsheetId is required")
		}
		sheetName := strings.TrimSpace(readString(config, "sheetName"))
		values, parseErr := parseSheetValues(config)
		if parseErr != nil {
			return map[string]any{"status": 0}, "invalid values", parseErr
		}
		out, err = google.AppendRow(ctx, accessToken, spreadsheetID, sheetName, values)
	case "gsheets.updaterow":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.updateRow: spreadsheetId is required")
		}
		rangeRef := strings.TrimSpace(readString(config, "range"))
		if rangeRef == "" {
			return map[string]any{"status": 0}, "missing range", errors.New("gsheets.updateRow: range is required")
		}
		values, parseErr := parseSheetValues(config)
		if parseErr != nil {
			return map[string]any{"status": 0}, "invalid values", parseErr
		}
		out, err = google.UpdateRow(ctx, accessToken, spreadsheetID, rangeRef, values)
	case "gsheets.getrows":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.getRows: spreadsheetId is required")
		}
		rangeRef := strings.TrimSpace(readString(config, "range"))
		if rangeRef == "" {
			return map[string]any{"status": 0}, "missing range", errors.New("gsheets.getRows: range is required")
		}
		out, err = google.GetRows(ctx, accessToken, spreadsheetID, rangeRef)
	case "gsheets.clearrange":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.clearRange: spreadsheetId is required")
		}
		rangeRef := strings.TrimSpace(readString(config, "range"))
		if rangeRef == "" {
			return map[string]any{"status": 0}, "missing range", errors.New("gsheets.clearRange: range is required")
		}
		out, err = google.ClearRange(ctx, accessToken, spreadsheetID, rangeRef)
	case "gsheets.createsheet":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.createSheet: spreadsheetId is required")
		}
		sheetName := strings.TrimSpace(readString(config, "sheetName"))
		if sheetName == "" {
			return map[string]any{"status": 0}, "missing sheetName", errors.New("gsheets.createSheet: sheetName is required")
		}
		out, err = google.CreateSheet(ctx, accessToken, spreadsheetID, sheetName)
	case "gsheets.deletesheet":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.deleteSheet: spreadsheetId is required")
		}
		sheetName := strings.TrimSpace(readString(config, "sheetName"))
		if sheetName == "" {
			return map[string]any{"status": 0}, "missing sheetName", errors.New("gsheets.deleteSheet: sheetName is required")
		}
		sheetID, lookupErr := google.ResolveSheetID(ctx, accessToken, spreadsheetID, sheetName)
		if lookupErr != nil {
			return map[string]any{"status": 0}, "sheet lookup failed", lookupErr
		}
		out, err = google.DeleteSheet(ctx, accessToken, spreadsheetID, sheetID)
	case "gsheets.deleterowsorcolumns":
		spreadsheetID := strings.TrimSpace(readString(config, "spreadsheetId"))
		if spreadsheetID == "" {
			return map[string]any{"status": 0}, "missing spreadsheetId", errors.New("gsheets.deleteRowsOrColumns: spreadsheetId is required")
		}
		sheetName := strings.TrimSpace(readString(config, "sheetName"))
		if sheetName == "" {
			return map[string]any{"status": 0}, "missing sheetName", errors.New("gsheets.deleteRowsOrColumns: sheetName is required")
		}
		dimension := strings.ToUpper(strings.TrimSpace(readString(config, "dimension")))
		if dimension != "ROWS" && dimension != "COLUMNS" {
			return map[string]any{"status": 0}, "invalid dimension", errors.New("gsheets.deleteRowsOrColumns: dimension must be ROWS or COLUMNS")
		}
		startIndex := readInt(config, "startIndex")
		endIndex := readInt(config, "endIndex")
		if endIndex <= startIndex {
			return map[string]any{"status": 0}, "invalid range", errors.New("gsheets.deleteRowsOrColumns: endIndex must be > startIndex")
		}
		sheetID, lookupErr := google.ResolveSheetID(ctx, accessToken, spreadsheetID, sheetName)
		if lookupErr != nil {
			return map[string]any{"status": 0}, "sheet lookup failed", lookupErr
		}
		out, err = google.DeleteDimensions(ctx, accessToken, spreadsheetID, sheetID, dimension, startIndex, endIndex)
	default:
		return map[string]any{"status": 0}, "unsupported sheets action", fmt.Errorf("app(gsheets): unsupported action %q", action)
	}

	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "sheets action failed", err
	}
	return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}

func executeAppGitHub(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
	credentialID := strings.TrimSpace(readString(config, "credentialId"))
	if credentialID == "" {
		return map[string]any{"status": 0}, "missing credential", errors.New("github: credentialId is required")
	}
	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return map[string]any{"status": 0}, "credential load failed", err
	}
	if strings.ToLower(strings.TrimSpace(cred.Provider)) != "github" {
		return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("github: expected github credential")
	}
	accessToken := strings.TrimSpace(readAnyString(payload["access_token"]))
	if accessToken == "" {
		return map[string]any{"status": 0}, "missing token", errors.New("github: access token missing")
	}

	started := time.Now()
	var out map[string]any
	switch strings.ToLower(strings.TrimSpace(action)) {
	case "github.createissue":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		title := strings.TrimSpace(readString(config, "title"))
		body := readString(config, "body")
		if owner == "" || repo == "" || title == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.createIssue: owner, repo, and title are required")
		}
		out, err = github.CreateIssue(ctx, accessToken, owner, repo, title, body)
	case "github.getissue":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		issueNumber := readInt(config, "issueNumber")
		if owner == "" || repo == "" || issueNumber <= 0 {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.getIssue: owner, repo, and issueNumber are required")
		}
		out, err = github.GetIssue(ctx, accessToken, owner, repo, issueNumber)
	case "github.editissue":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		issueNumber := readInt(config, "issueNumber")
		title := strings.TrimSpace(readString(config, "title"))
		body := readString(config, "body")
		state := strings.TrimSpace(readString(config, "state"))
		if owner == "" || repo == "" || issueNumber <= 0 {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.editIssue: owner, repo, and issueNumber are required")
		}
		out, err = github.EditIssue(ctx, accessToken, owner, repo, issueNumber, title, body, state)
	case "github.createissuecomment":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		issueNumber := readInt(config, "issueNumber")
		body := readString(config, "body")
		if owner == "" || repo == "" || issueNumber <= 0 || strings.TrimSpace(body) == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.createIssueComment: owner, repo, issueNumber, and body are required")
		}
		out, err = github.CreateIssueComment(ctx, accessToken, owner, repo, issueNumber, body)
	case "github.lockissue":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		issueNumber := readInt(config, "issueNumber")
		lockReason := strings.TrimSpace(readString(config, "lockReason"))
		if owner == "" || repo == "" || issueNumber <= 0 {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.lockIssue: owner, repo, and issueNumber are required")
		}
		out, err = github.LockIssue(ctx, accessToken, owner, repo, issueNumber, lockReason)
	case "github.createfile":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		path := strings.TrimSpace(readString(config, "path"))
		message := strings.TrimSpace(readString(config, "message"))
		content := readString(config, "content")
		branch := strings.TrimSpace(readString(config, "branch"))
		if owner == "" || repo == "" || path == "" || message == "" || strings.TrimSpace(content) == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.createFile: owner, repo, path, message, and content are required")
		}
		out, err = github.CreateFile(ctx, accessToken, owner, repo, path, message, content, branch)
	case "github.editfile":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		path := strings.TrimSpace(readString(config, "path"))
		message := strings.TrimSpace(readString(config, "message"))
		content := readString(config, "content")
		sha := strings.TrimSpace(readString(config, "sha"))
		branch := strings.TrimSpace(readString(config, "branch"))
		if owner == "" || repo == "" || path == "" || message == "" || strings.TrimSpace(content) == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.editFile: owner, repo, path, message, and content are required")
		}
		out, err = github.EditFile(ctx, accessToken, owner, repo, path, message, content, sha, branch)
	case "github.deletefile":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		path := strings.TrimSpace(readString(config, "path"))
		message := strings.TrimSpace(readString(config, "message"))
		sha := strings.TrimSpace(readString(config, "sha"))
		branch := strings.TrimSpace(readString(config, "branch"))
		if owner == "" || repo == "" || path == "" || message == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.deleteFile: owner, repo, path, and message are required")
		}
		out, err = github.DeleteFile(ctx, accessToken, owner, repo, path, message, sha, branch)
	case "github.getfile":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		path := strings.TrimSpace(readString(config, "path"))
		ref := strings.TrimSpace(readString(config, "ref"))
		if owner == "" || repo == "" || path == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.getFile: owner, repo, and path are required")
		}
		out, err = github.GetFile(ctx, accessToken, owner, repo, path, ref)
	case "github.listfiles":
		owner := strings.TrimSpace(readString(config, "owner"))
		repo := strings.TrimSpace(readString(config, "repo"))
		path := strings.TrimSpace(readString(config, "path"))
		ref := strings.TrimSpace(readString(config, "ref"))
		if owner == "" || repo == "" {
			return map[string]any{"status": 0}, "missing fields", errors.New("github.listFiles: owner and repo are required")
		}
		out, err = github.ListFiles(ctx, accessToken, owner, repo, path, ref)
	case "github.listorgrepos":
		org := strings.TrimSpace(readString(config, "org"))
		if org == "" {
			return map[string]any{"status": 0}, "missing org", errors.New("github.listOrgRepos: org is required")
		}
		out, err = github.ListOrgRepos(ctx, accessToken, org)
	default:
		return map[string]any{"status": 0}, "unsupported github action", fmt.Errorf("app(github): unsupported action %q", action)
	}

	duration := time.Since(started)
	outputs := map[string]any{
		"status": 200,
		"data":   out,
		"meta": map[string]any{
			"duration_ms": duration.Milliseconds(),
		},
	}
	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "github action failed", err
	}
	return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}

func readInt(cfg map[string]any, key string) int {
	if cfg == nil {
		return 0
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return 0
	}
	switch v := raw.(type) {
	case int:
		return v
	case int32:
		return int(v)
	case int64:
		return int(v)
	case float64:
		return int(v)
	case float32:
		return int(v)
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" {
			return 0
		}
		var out int
		_, _ = fmt.Sscanf(trim, "%d", &out)
		return out
	default:
		var out int
		_, _ = fmt.Sscanf(fmt.Sprint(v), "%d", &out)
		return out
	}
}

func parseSheetValues(config map[string]any) ([]any, error) {
	raw, ok := config["values"]
	if !ok || raw == nil {
		return nil, errors.New("values is required")
	}

	switch v := raw.(type) {
	case []any:
		if len(v) == 0 {
			return nil, errors.New("values is required")
		}
		return v, nil
	case []string:
		if len(v) == 0 {
			return nil, errors.New("values is required")
		}
		out := make([]any, 0, len(v))
		for _, item := range v {
			out = append(out, item)
		}
		return out, nil
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" {
			return nil, errors.New("values is required")
		}
		parsed := parseJSONOrString(trim)
		switch pv := parsed.(type) {
		case []any:
			if len(pv) == 0 {
				return nil, errors.New("values is required")
			}
			return pv, nil
		case []string:
			if len(pv) == 0 {
				return nil, errors.New("values is required")
			}
			out := make([]any, 0, len(pv))
			for _, item := range pv {
				out = append(out, item)
			}
			return out, nil
		default:
			if strings.Contains(trim, ",") {
				parts := strings.Split(trim, ",")
				out := make([]any, 0, len(parts))
				for _, part := range parts {
					out = append(out, strings.TrimSpace(part))
				}
				return out, nil
			}
			return []any{trim}, nil
		}
	default:
		return []any{fmt.Sprint(v)}, nil
	}
}
