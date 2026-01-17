package temporal

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/adapters/external/bannerbear"
)

func executeAppBannerbear(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
	apiKey := strings.TrimSpace(readString(config, "apiKey"))
	if apiKey == "" {
		credentialID := strings.TrimSpace(readString(config, "credentialId"))
		if credentialID == "" {
			return map[string]any{"status": 0}, "missing credential", errors.New("bannerbear: credentialId or apiKey is required")
		}
		cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
		if err != nil {
			return map[string]any{"status": 0}, "credential load failed", err
		}
		provider := strings.ToLower(strings.TrimSpace(cred.Provider))
		if provider != "bannerbear" && provider != "bananabear" {
			return map[string]any{"status": 0}, "credential provider mismatch", fmt.Errorf("bannerbear: expected bannerbear credential")
		}
		apiKey = strings.TrimSpace(readAnyString(payload["api_key"]))
		if apiKey == "" {
			apiKey = strings.TrimSpace(readAnyString(payload["apiKey"]))
		}
		if apiKey == "" {
			return map[string]any{"status": 0}, "missing api key", errors.New("bannerbear: api key missing")
		}
	}

	started := time.Now()
	var out map[string]any
	var err error
	switch strings.ToLower(strings.TrimSpace(action)) {
	case "bannerbear.createimage":
		templateUID := strings.TrimSpace(readString(config, "templateUid"))
		if templateUID == "" {
			return map[string]any{"status": 0}, "missing templateUid", errors.New("bannerbear.createImage: templateUid is required")
		}
		webhookURL := strings.TrimSpace(readString(config, "webhookUrl"))

		var mods any
		if raw, ok := config["modifications"]; ok && raw != nil {
			switch v := raw.(type) {
			case string:
				trim := strings.TrimSpace(v)
				if trim != "" {
					parsed := parseJSONOrString(trim)
					if parsed != "" {
						mods = parsed
					}
				}
			default:
				mods = v
			}
		}
		out, _, err = bannerbear.CreateImage(ctx, apiKey, templateUID, mods, webhookURL)
	case "bannerbear.getimage":
		imageUID := strings.TrimSpace(readString(config, "imageUid"))
		if imageUID == "" {
			return map[string]any{"status": 0}, "missing imageUid", errors.New("bannerbear.getImage: imageUid is required")
		}
		out, _, err = bannerbear.GetImage(ctx, apiKey, imageUID)
	case "bannerbear.gettemplate":
		templateUID := strings.TrimSpace(readString(config, "templateUid"))
		if templateUID == "" {
			return map[string]any{"status": 0}, "missing templateUid", errors.New("bannerbear.getTemplate: templateUid is required")
		}
		out, _, err = bannerbear.GetTemplate(ctx, apiKey, templateUID)
	case "bannerbear.listtemplates":
		page := readInt(config, "page")
		perPage := readInt(config, "perPage")
		out, _, err = bannerbear.ListTemplates(ctx, apiKey, page, perPage)
	default:
		return map[string]any{"status": 0}, "unsupported bannerbear action", fmt.Errorf("app(bannerbear): unsupported action %q", action)
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
		return outputs, "bannerbear action failed", err
	}
	return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}
