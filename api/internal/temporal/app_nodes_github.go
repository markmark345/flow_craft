package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/connectors/github"
)

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
	case "github.listorgrepos":
		org := strings.TrimSpace(readString(config, "org"))
		if org == "" {
			return map[string]any{"status": 0}, "missing org", errors.New("github.listOrgRepos: org is required")
		}
		out, err = github.ListOrgRepos(ctx, accessToken, org)
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
