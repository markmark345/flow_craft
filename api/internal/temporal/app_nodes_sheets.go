package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/connectors/google"
)

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

func ParseSheetValuesForTest(config map[string]any) ([]any, error) {
	return parseSheetValues(config)
}
