package github

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

func CreateIssue(ctx context.Context, accessToken string, owner string, repo string, title string, body string) (map[string]any, error) {
	if strings.TrimSpace(owner) == "" || strings.TrimSpace(repo) == "" {
		return nil, fmt.Errorf("missing repo owner or name")
	}
	payload := map[string]any{
		"title": title,
		"body":  body,
	}
	target := fmt.Sprintf("%s/repos/%s/%s/issues", BaseURL, url.PathEscape(owner), url.PathEscape(repo))
	decoded, _, err := doJSON(ctx, accessToken, http.MethodPost, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func GetIssue(ctx context.Context, accessToken string, owner string, repo string, issueNumber int) (map[string]any, error) {
	target := fmt.Sprintf(
		fmt.Sprintf("%s/repos/%s/%s/issues/%d", BaseURL, owner, repo, issueNumber),
		url.PathEscape(owner),
		url.PathEscape(repo),
		issueNumber,
	)
	decoded, _, err := doJSON(ctx, accessToken, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func EditIssue(ctx context.Context, accessToken string, owner string, repo string, issueNumber int, title string, body string, state string) (map[string]any, error) {
	payload := map[string]any{}
	if strings.TrimSpace(title) != "" {
		payload["title"] = title
	}
	if body != "" {
		payload["body"] = body
	}
	if strings.TrimSpace(state) != "" {
		payload["state"] = state
	}
	target := fmt.Sprintf(
		fmt.Sprintf("%s/repos/%s/%s/issues/%d", BaseURL, owner, repo, issueNumber),
		url.PathEscape(owner),
		url.PathEscape(repo),
		issueNumber,
	)
	decoded, _, err := doJSON(ctx, accessToken, http.MethodPatch, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func CreateIssueComment(ctx context.Context, accessToken string, owner string, repo string, issueNumber int, body string) (map[string]any, error) {
	payload := map[string]any{
		"body": body,
	}
	target := fmt.Sprintf(
		fmt.Sprintf("%s/repos/%s/%s/issues/%d/comments", BaseURL, owner, repo, issueNumber),
		url.PathEscape(owner),
		url.PathEscape(repo),
		issueNumber,
	)
	decoded, _, err := doJSON(ctx, accessToken, http.MethodPost, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func LockIssue(ctx context.Context, accessToken string, owner string, repo string, issueNumber int, lockReason string) (map[string]any, error) {
	payload := map[string]any{}
	if strings.TrimSpace(lockReason) != "" {
		payload["lock_reason"] = lockReason
	}
	target := fmt.Sprintf(
		fmt.Sprintf("%s/repos/%s/%s/issues/%d/lock", BaseURL, owner, repo, issueNumber),
		url.PathEscape(owner),
		url.PathEscape(repo),
		issueNumber,
	)
	decoded, status, err := doJSON(ctx, accessToken, http.MethodPut, target, payload)
	if err != nil {
		return nil, err
	}
	if decoded == nil {
		return map[string]any{"status": status}, nil
	}
	return coerceMap(decoded), nil
}
