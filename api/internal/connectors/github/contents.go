package github

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

type ContentInfo struct {
	SHA         string
	Type        string
	Name        string
	Path        string
	DownloadURL string
}

func GetFile(ctx context.Context, accessToken string, owner string, repo string, path string, ref string) (map[string]any, error) {
	target := contentsURL(owner, repo, path, ref)
	decoded, _, err := doJSON(ctx, accessToken, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func ListFiles(ctx context.Context, accessToken string, owner string, repo string, path string, ref string) (map[string]any, error) {
	target := contentsURL(owner, repo, path, ref)
	decoded, _, err := doJSON(ctx, accessToken, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func CreateFile(ctx context.Context, accessToken string, owner string, repo string, path string, message string, content string, branch string) (map[string]any, error) {
	if strings.TrimSpace(path) == "" {
		return nil, errors.New("path is required")
	}
	payload := map[string]any{
		"message": message,
		"content": base64.StdEncoding.EncodeToString([]byte(content)),
	}
	if strings.TrimSpace(branch) != "" {
		payload["branch"] = branch
	}
	target := contentsURL(owner, repo, path, "")
	decoded, _, err := doJSON(ctx, accessToken, http.MethodPut, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func EditFile(ctx context.Context, accessToken string, owner string, repo string, path string, message string, content string, sha string, branch string) (map[string]any, error) {
	if strings.TrimSpace(path) == "" {
		return nil, errors.New("path is required")
	}
	if strings.TrimSpace(sha) == "" {
		info, err := resolveFileInfo(ctx, accessToken, owner, repo, path, branch)
		if err != nil {
			return nil, err
		}
		sha = info.SHA
	}
	payload := map[string]any{
		"message": message,
		"content": base64.StdEncoding.EncodeToString([]byte(content)),
		"sha":     sha,
	}
	if strings.TrimSpace(branch) != "" {
		payload["branch"] = branch
	}
	target := contentsURL(owner, repo, path, "")
	decoded, _, err := doJSON(ctx, accessToken, http.MethodPut, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func DeleteFile(ctx context.Context, accessToken string, owner string, repo string, path string, message string, sha string, branch string) (map[string]any, error) {
	if strings.TrimSpace(path) == "" {
		return nil, errors.New("path is required")
	}
	if strings.TrimSpace(sha) == "" {
		info, err := resolveFileInfo(ctx, accessToken, owner, repo, path, branch)
		if err != nil {
			return nil, err
		}
		sha = info.SHA
	}
	payload := map[string]any{
		"message": message,
		"sha":     sha,
	}
	if strings.TrimSpace(branch) != "" {
		payload["branch"] = branch
	}
	target := contentsURL(owner, repo, path, "")
	decoded, _, err := doJSON(ctx, accessToken, http.MethodDelete, target, payload)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

func contentsURL(owner string, repo string, path string, ref string) string {
	base := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents", url.PathEscape(owner), url.PathEscape(repo))
	escaped := escapeGitHubPath(path)
	if escaped != "" {
		base += "/" + escaped
	}
	if strings.TrimSpace(ref) == "" {
		return base
	}
	q := url.Values{}
	q.Set("ref", ref)
	return base + "?" + q.Encode()
}

func escapeGitHubPath(path string) string {
	path = strings.TrimSpace(path)
	path = strings.Trim(path, "/")
	if path == "" {
		return ""
	}
	parts := strings.Split(path, "/")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		out = append(out, url.PathEscape(part))
	}
	return strings.Join(out, "/")
}

func resolveFileInfo(ctx context.Context, accessToken string, owner string, repo string, path string, ref string) (ContentInfo, error) {
	out, err := GetFile(ctx, accessToken, owner, repo, path, ref)
	if err != nil {
		return ContentInfo{}, err
	}
	sha := strings.TrimSpace(readAnyString(out["sha"]))
	if sha == "" {
		if inner, ok := out["data"].(map[string]any); ok {
			sha = strings.TrimSpace(readAnyString(inner["sha"]))
		}
	}
	typ := strings.TrimSpace(readAnyString(out["type"]))
	name := strings.TrimSpace(readAnyString(out["name"]))
	p := strings.TrimSpace(readAnyString(out["path"]))
	download := strings.TrimSpace(readAnyString(out["download_url"]))
	if sha == "" {
		return ContentInfo{}, errors.New("unable to resolve file sha")
	}
	return ContentInfo{SHA: sha, Type: typ, Name: name, Path: p, DownloadURL: download}, nil
}
