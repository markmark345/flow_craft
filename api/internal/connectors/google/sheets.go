package google

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func CreateSpreadsheet(ctx context.Context, accessToken string, title string, sheetName string) (map[string]any, error) {
	payload := map[string]any{
		"properties": map[string]any{
			"title": title,
		},
	}
	if strings.TrimSpace(sheetName) != "" {
		payload["sheets"] = []any{
			map[string]any{
				"properties": map[string]any{
					"title": sheetName,
				},
			},
		}
	}
	return doJSON(ctx, http.MethodPost, "https://sheets.googleapis.com/v4/spreadsheets", accessToken, payload)
}

func DeleteSpreadsheet(ctx context.Context, accessToken string, spreadsheetID string) (map[string]any, error) {
	url := fmt.Sprintf("https://www.googleapis.com/drive/v3/files/%s", url.PathEscape(spreadsheetID))
	return doJSON(ctx, http.MethodDelete, url, accessToken, nil)
}

func AppendRow(ctx context.Context, accessToken string, spreadsheetID string, sheetName string, values []any) (map[string]any, error) {
	rangeRef := strings.TrimSpace(sheetName)
	if rangeRef == "" {
		rangeRef = "Sheet1"
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s:append", url.PathEscape(spreadsheetID), url.PathEscape(rangeRef))
	query := url.Values{}
	query.Set("valueInputOption", "USER_ENTERED")
	fullURL := path + "?" + query.Encode()
	payload := map[string]any{
		"values": [][]any{values},
	}
	return doJSON(ctx, http.MethodPost, fullURL, accessToken, payload)
}

func UpdateRow(ctx context.Context, accessToken string, spreadsheetID string, rangeRef string, values []any) (map[string]any, error) {
	if strings.TrimSpace(rangeRef) == "" {
		return nil, errors.New("range is required")
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s", url.PathEscape(spreadsheetID), url.PathEscape(rangeRef))
	query := url.Values{}
	query.Set("valueInputOption", "USER_ENTERED")
	fullURL := path + "?" + query.Encode()
	payload := map[string]any{
		"values": [][]any{values},
	}
	return doJSON(ctx, http.MethodPut, fullURL, accessToken, payload)
}

func GetRows(ctx context.Context, accessToken string, spreadsheetID string, rangeRef string) (map[string]any, error) {
	if strings.TrimSpace(rangeRef) == "" {
		return nil, errors.New("range is required")
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s", url.PathEscape(spreadsheetID), url.PathEscape(rangeRef))
	return doJSON(ctx, http.MethodGet, path, accessToken, nil)
}

func ClearRange(ctx context.Context, accessToken string, spreadsheetID string, rangeRef string) (map[string]any, error) {
	if strings.TrimSpace(rangeRef) == "" {
		return nil, errors.New("range is required")
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s:clear", url.PathEscape(spreadsheetID), url.PathEscape(rangeRef))
	return doJSON(ctx, http.MethodPost, path, accessToken, map[string]any{})
}

func CreateSheet(ctx context.Context, accessToken string, spreadsheetID string, sheetName string) (map[string]any, error) {
	if strings.TrimSpace(sheetName) == "" {
		return nil, errors.New("sheet name is required")
	}
	payload := map[string]any{
		"requests": []any{
			map[string]any{
				"addSheet": map[string]any{
					"properties": map[string]any{
						"title": sheetName,
					},
				},
			},
		},
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s:batchUpdate", url.PathEscape(spreadsheetID))
	return doJSON(ctx, http.MethodPost, path, accessToken, payload)
}

func DeleteSheet(ctx context.Context, accessToken string, spreadsheetID string, sheetID int) (map[string]any, error) {
	payload := map[string]any{
		"requests": []any{
			map[string]any{
				"deleteSheet": map[string]any{
					"sheetId": sheetID,
				},
			},
		},
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s:batchUpdate", url.PathEscape(spreadsheetID))
	return doJSON(ctx, http.MethodPost, path, accessToken, payload)
}

func DeleteDimensions(ctx context.Context, accessToken string, spreadsheetID string, sheetID int, dimension string, startIndex int, endIndex int) (map[string]any, error) {
	payload := map[string]any{
		"requests": []any{
			map[string]any{
				"deleteDimension": map[string]any{
					"range": map[string]any{
						"sheetId":    sheetID,
						"dimension":  dimension,
						"startIndex": startIndex,
						"endIndex":   endIndex,
					},
				},
			},
		},
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s:batchUpdate", url.PathEscape(spreadsheetID))
	return doJSON(ctx, http.MethodPost, path, accessToken, payload)
}

func ResolveSheetID(ctx context.Context, accessToken string, spreadsheetID string, sheetName string) (int, error) {
	if strings.TrimSpace(sheetName) == "" {
		return 0, errors.New("sheet name is required")
	}
	path := fmt.Sprintf("https://sheets.googleapis.com/v4/spreadsheets/%s?fields=sheets(properties(sheetId,title))", url.PathEscape(spreadsheetID))
	out, err := doJSON(ctx, http.MethodGet, path, accessToken, nil)
	if err != nil {
		return 0, err
	}
	rawSheets, ok := out["sheets"].([]any)
	if !ok {
		return 0, errors.New("unable to read sheets metadata")
	}
	for _, entry := range rawSheets {
		sheet, ok := entry.(map[string]any)
		if !ok {
			continue
		}
		props, ok := sheet["properties"].(map[string]any)
		if !ok {
			continue
		}
		title := strings.TrimSpace(readString(props, "title"))
		if strings.EqualFold(title, sheetName) {
			switch v := props["sheetId"].(type) {
			case int:
				return v, nil
			case int32:
				return int(v), nil
			case int64:
				return int(v), nil
			case float64:
				return int(v), nil
			default:
				return 0, errors.New("invalid sheet id")
			}
		}
	}
	return 0, errors.New("sheet not found")
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

func doJSON(ctx context.Context, method string, target string, accessToken string, payload any) (map[string]any, error) {
	var body *bytes.Reader
	if payload != nil {
		raw, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		body = bytes.NewReader(raw)
	} else {
		body = bytes.NewReader(nil)
	}

	req, err := http.NewRequestWithContext(ctx, method, target, body)
	if err != nil {
		return nil, err
	}
	if accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+accessToken)
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("sheets error: %s", res.Status)
	}
	if res.ContentLength == 0 || res.StatusCode == http.StatusNoContent {
		return map[string]any{"status": res.StatusCode}, nil
	}
	var decoded any
	if err := json.NewDecoder(res.Body).Decode(&decoded); err != nil {
		return nil, err
	}
	if decoded == nil {
		return map[string]any{"status": res.StatusCode}, nil
	}
	if m, ok := decoded.(map[string]any); ok {
		return m, nil
	}
	return map[string]any{"data": decoded}, nil
}
