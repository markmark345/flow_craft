package temporal

import (
	"context"
	"fmt"
	"strings"
)

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
		case strings.HasPrefix(strings.ToLower(action), "bannerbear."):
			app = "bannerbear"
		case strings.HasPrefix(strings.ToLower(action), "slack."):
			app = "slack"
		case strings.HasPrefix(strings.ToLower(action), "notion."):
			app = "notion"
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
	case "bannerbear", "bananabear":
		if action == "" {
			action = "bannerbear.createImage"
		}
		return executeAppBannerbear(ctx, config, deps, action)
	case "slack":
		if action == "" {
			action = "slack.sendMessage"
		}
		return executeAppSlack(ctx, config, deps, action)
	case "notion":
		if action == "" {
			action = "notion.createPage"
		}
		return executeAppNotion(ctx, config, deps, action)
	default:
		return map[string]any{"status": 0}, "unsupported app", fmt.Errorf("app: unsupported app %q", app)
	}
}

func ExecuteAppForTest(ctx context.Context, config map[string]any) (map[string]any, string, error) {
	return executeApp(ctx, config, stepDependencies{})
}
