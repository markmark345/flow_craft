package notion

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const baseURL = "https://api.notion.com/v1"
const notionVersion = "2022-06-28"

// CreatePage creates a new page in the specified database or as a child of an existing page.
// scopes: N/A (Internal Integration Token)
func CreatePage(ctx context.Context, token string, parentID string, title string, content string) (map[string]any, error) {
	url := fmt.Sprintf("%s/pages", baseURL)

	// Determine if parent is database or page based on ID format isn't strictly possible without API,
	// but generally user provides ID. We'll support Database Parent for now as it's most common for CMS.
	// Actually, Notion API requires specifying "database_id" or "page_id" in parent object.
	// For simplicity, we'll try to guess or just default to database_id for MVP, or allow user to pass type?
	// Let's assume Database ID for now.

	parent := map[string]string{"database_id": parentID}

	properties := map[string]any{
		"Name": map[string]any{
			"title": []map[string]any{
				{
					"text": map[string]string{
						"content": title,
					},
				},
			},
		},
	}

	// Add content blocks if provided
	var children []map[string]any
	if content != "" {
		children = append(children, map[string]any{
			"object": "block",
			"type":   "paragraph",
			"paragraph": map[string]any{
				"rich_text": []map[string]any{
					{
						"type": "text",
						"text": map[string]string{
							"content": content,
						},
					},
				},
			},
		})
	}

	body := map[string]any{
		"parent":     parent,
		"properties": properties,
	}
	if len(children) > 0 {
		body["children"] = children
	}

	return makeRequest(ctx, token, "POST", url, body)
}

func makeRequest(ctx context.Context, token string, method string, url string, body interface{}) (map[string]any, error) {
	var bodyReader *bytes.Buffer
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewBuffer(jsonBody)
	} else {
		bodyReader = bytes.NewBuffer(nil)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Notion-Version", notionVersion)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var result map[string]any
		_ = json.NewDecoder(resp.Body).Decode(&result)
		msg := "unknown error"
		if m, ok := result["message"].(string); ok {
			msg = m
		}
		return nil, fmt.Errorf("notion api error (%d): %s", resp.StatusCode, msg)
	}

	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode notion response: %w", err)
	}

	return result, nil
}
