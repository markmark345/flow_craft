package temporal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/adapters/external/gemini"
	"flowcraft-api/internal/adapters/external/grok"
	"flowcraft-api/internal/adapters/external/openai"
)

func executeAIAgent(ctx context.Context, config map[string]any, input map[string]any, steps map[string]any, deps stepDependencies) (map[string]any, string, error) {
	var (
		modelNodeType string
		modelCfg      map[string]any
	)
	if cfg, ok := config["model"].(map[string]any); ok && cfg != nil {
		modelNodeType = "chatModel"
		modelCfg = cfg
	} else if modelRef, ok := config["__model"].(map[string]any); ok {
		modelNodeType = strings.TrimSpace(readAnyString(modelRef["nodeType"]))
		modelCfg, _ = modelRef["config"].(map[string]any)
	}
	if strings.TrimSpace(modelNodeType) == "" || modelCfg == nil {
		return map[string]any{"status": 0}, "missing model", errors.New("aiAgent: model is required")
	}

	provider, baseURL, modelName, apiKey, err := resolveChatModel(ctx, deps, modelNodeType, modelCfg)
	if err != nil {
		return map[string]any{"status": 0}, "model load failed", err
	}

	systemPrompt := strings.TrimSpace(readString(config, "systemPrompt"))
	template := readString(config, "prompt")
	temperature := readFloat(config, "temperature", 0.7)
	maxTokens := readInt(config, "maxTokens")

	prompt := strings.TrimSpace(renderPrompt(template, input, steps))
	if prompt == "" {
		prompt = strings.TrimSpace(renderPrompt("{{input}}", input, steps))
	}
	if prompt == "" {
		return map[string]any{"status": 0}, "missing prompt", errors.New("aiAgent: prompt is required")
	}

	started := time.Now()
	var raw any
	switch provider {
	case "openai", "grok":
		payload := buildOpenAIChatPayload(modelName, systemPrompt, prompt, temperature, maxTokens)
		raw, _, err = openai.ChatCompletions(ctx, baseURL, apiKey, payload)
	case "custom":
		payload := buildOpenAIChatPayload(modelName, systemPrompt, prompt, temperature, maxTokens)
		raw, _, err = openai.ChatCompletions(ctx, baseURL, apiKey, payload)
	case "gemini":
		payload := buildGeminiPayload(systemPrompt, prompt, temperature, maxTokens)
		raw, _, err = gemini.GenerateContent(ctx, baseURL, apiKey, modelName, payload)
	default:
		err = fmt.Errorf("aiAgent: unsupported provider %q", provider)
	}
	duration := time.Since(started)

	outputs := map[string]any{
		"status": 200,
		"data": map[string]any{
			"text":  extractModelText(provider, raw),
			"raw":   raw,
			"model": modelName,
		},
		"meta": map[string]any{
			"provider":    provider,
			"duration_ms": duration.Milliseconds(),
		},
	}

	if err != nil {
		outputs["status"] = 0
		outputs["error"] = err.Error()
		return outputs, "ai agent failed", err
	}

	text := strings.TrimSpace(readNestedString(outputs, "data", "text"))
	if text == "" {
		return outputs, fmt.Sprintf("ai agent (%s) empty response (%dms)", provider, duration.Milliseconds()), nil
	}
	return outputs, fmt.Sprintf("ai agent (%s) %dms", provider, duration.Milliseconds()), nil
}

func resolveChatModel(ctx context.Context, deps stepDependencies, nodeType string, modelCfg map[string]any) (provider string, baseURL string, model string, apiKey string, err error) {
	switch strings.ToLower(strings.TrimSpace(nodeType)) {
	case "chatmodel":
		provider = strings.ToLower(strings.TrimSpace(readString(modelCfg, "provider")))
		if provider == "" {
			provider = "openai"
		}
		model = strings.TrimSpace(readString(modelCfg, "model"))
		apiKey = strings.TrimSpace(readString(modelCfg, "apiKeyOverride"))
		if apiKey == "" {
			apiKey = strings.TrimSpace(readString(modelCfg, "apiKey"))
		}
		baseURL = strings.TrimSpace(readString(modelCfg, "baseUrl"))
		switch provider {
		case "openai":
			if baseURL == "" {
				baseURL = openai.DefaultBaseURL
			}
			if apiKey == "" {
				apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "openai")
			}
		case "grok":
			if baseURL == "" {
				baseURL = grok.BaseURL
			}
			if apiKey == "" {
				apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "grok")
			}
		case "gemini":
			if baseURL == "" {
				baseURL = gemini.DefaultBaseURL
			}
			if apiKey == "" {
				apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "gemini")
			}
		case "custom":
			if baseURL == "" {
				baseURL = openai.DefaultBaseURL
			}
		default:
			return "", "", "", "", fmt.Errorf("aiAgent: unsupported model provider %q", provider)
		}
	case "openaichatmodel":
		provider = "openai"
		baseURL = strings.TrimSpace(readString(modelCfg, "baseUrl"))
		if baseURL == "" {
			baseURL = openai.DefaultBaseURL
		}
		model = strings.TrimSpace(readString(modelCfg, "model"))
		apiKey = strings.TrimSpace(readString(modelCfg, "apiKey"))
		if apiKey == "" {
			apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "openai")
		}
	case "grokchatmodel":
		provider = "grok"
		baseURL = strings.TrimSpace(readString(modelCfg, "baseUrl"))
		if baseURL == "" {
			baseURL = grok.BaseURL
		}
		model = strings.TrimSpace(readString(modelCfg, "model"))
		apiKey = strings.TrimSpace(readString(modelCfg, "apiKey"))
		if apiKey == "" {
			apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "grok")
		}
	case "geminichatmodel":
		provider = "gemini"
		baseURL = strings.TrimSpace(readString(modelCfg, "baseUrl"))
		if baseURL == "" {
			baseURL = gemini.DefaultBaseURL
		}
		model = strings.TrimSpace(readString(modelCfg, "model"))
		apiKey = strings.TrimSpace(readString(modelCfg, "apiKey"))
		if apiKey == "" {
			apiKey, err = loadAPIKeyFromCredential(ctx, deps, strings.TrimSpace(readString(modelCfg, "credentialId")), "gemini")
		}
	default:
		return "", "", "", "", fmt.Errorf("aiAgent: unsupported model node %q", nodeType)
	}

	if err != nil {
		return "", "", "", "", err
	}
	if strings.TrimSpace(model) == "" {
		return "", "", "", "", errors.New("aiAgent: model is required")
	}
	if strings.TrimSpace(apiKey) == "" {
		return "", "", "", "", errors.New("aiAgent: api key is required")
	}
	return provider, baseURL, model, apiKey, nil
}

func loadAPIKeyFromCredential(ctx context.Context, deps stepDependencies, credentialID string, expectedProvider string) (string, error) {
	credentialID = strings.TrimSpace(credentialID)
	if credentialID == "" {
		return "", fmt.Errorf("%s: credentialId is required", expectedProvider)
	}
	cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
	if err != nil {
		return "", err
	}
	if !strings.EqualFold(strings.TrimSpace(cred.Provider), strings.TrimSpace(expectedProvider)) {
		return "", fmt.Errorf("%s: expected %s credential", expectedProvider, expectedProvider)
	}
	apiKey := strings.TrimSpace(readAnyString(payload["api_key"]))
	if apiKey == "" {
		apiKey = strings.TrimSpace(readAnyString(payload["apiKey"]))
	}
	if apiKey == "" {
		return "", fmt.Errorf("%s: api key missing", expectedProvider)
	}
	return apiKey, nil
}

func readFloat(cfg map[string]any, key string, fallback float64) float64 {
	if cfg == nil {
		return fallback
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return fallback
	}
	switch v := raw.(type) {
	case float64:
		return v
	case float32:
		return float64(v)
	case int:
		return float64(v)
	case int64:
		return float64(v)
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" {
			return fallback
		}
		var out float64
		if _, err := fmt.Sscanf(trim, "%f", &out); err == nil {
			return out
		}
		return fallback
	default:
		var out float64
		if _, err := fmt.Sscanf(fmt.Sprint(v), "%f", &out); err == nil {
			return out
		}
		return fallback
	}
}

func renderPrompt(template string, input map[string]any, steps map[string]any) string {
	if strings.TrimSpace(template) == "" {
		return ""
	}
	inputJSON := "{}"
	if input != nil {
		if b, err := json.Marshal(input); err == nil {
			inputJSON = string(b)
		}
	}
	stepsJSON := "{}"
	if steps != nil {
		if b, err := json.Marshal(steps); err == nil {
			stepsJSON = string(b)
		}
	}
	out := template
	out = strings.ReplaceAll(out, "{{input}}", inputJSON)
	out = strings.ReplaceAll(out, "{{steps}}", stepsJSON)
	return out
}

func buildOpenAIChatPayload(model string, systemPrompt string, prompt string, temperature float64, maxTokens int) map[string]any {
	messages := make([]map[string]any, 0, 2)
	if strings.TrimSpace(systemPrompt) != "" {
		messages = append(messages, map[string]any{"role": "system", "content": systemPrompt})
	}
	messages = append(messages, map[string]any{"role": "user", "content": prompt})

	payload := map[string]any{
		"model":    model,
		"messages": messages,
	}
	if temperature >= 0 {
		payload["temperature"] = temperature
	}
	if maxTokens > 0 {
		payload["max_tokens"] = maxTokens
	}
	return payload
}

func buildGeminiPayload(systemPrompt string, prompt string, temperature float64, maxTokens int) map[string]any {
	payload := map[string]any{
		"contents": []any{
			map[string]any{
				"role": "user",
				"parts": []any{
					map[string]any{"text": prompt},
				},
			},
		},
	}
	if strings.TrimSpace(systemPrompt) != "" {
		payload["systemInstruction"] = map[string]any{
			"parts": []any{map[string]any{"text": systemPrompt}},
		}
	}
	gen := map[string]any{}
	if temperature >= 0 {
		gen["temperature"] = temperature
	}
	if maxTokens > 0 {
		gen["maxOutputTokens"] = maxTokens
	}
	if len(gen) > 0 {
		payload["generationConfig"] = gen
	}
	return payload
}

func extractModelText(provider string, raw any) string {
	switch provider {
	case "gemini":
		return extractGeminiText(raw)
	default:
		return extractOpenAIText(raw)
	}
}

func extractOpenAIText(raw any) string {
	m, ok := raw.(map[string]any)
	if !ok {
		return ""
	}
	choices, ok := m["choices"].([]any)
	if !ok || len(choices) == 0 {
		return ""
	}
	first, ok := choices[0].(map[string]any)
	if !ok {
		return ""
	}
	msg, ok := first["message"].(map[string]any)
	if !ok {
		return ""
	}
	if content, ok := msg["content"].(string); ok {
		return content
	}
	return ""
}

func extractGeminiText(raw any) string {
	m, ok := raw.(map[string]any)
	if !ok {
		return ""
	}
	cands, ok := m["candidates"].([]any)
	if !ok || len(cands) == 0 {
		return ""
	}
	first, ok := cands[0].(map[string]any)
	if !ok {
		return ""
	}
	content, ok := first["content"].(map[string]any)
	if !ok {
		return ""
	}
	parts, ok := content["parts"].([]any)
	if !ok || len(parts) == 0 {
		return ""
	}
	var b strings.Builder
	for _, p := range parts {
		pm, ok := p.(map[string]any)
		if !ok {
			continue
		}
		if t, ok := pm["text"].(string); ok && t != "" {
			if b.Len() > 0 {
				b.WriteString("\n")
			}
			b.WriteString(t)
		}
	}
	return b.String()
}

func readNestedString(root map[string]any, keys ...string) string {
	if root == nil {
		return ""
	}
	cur := root
	for idx, key := range keys {
		raw, ok := cur[key]
		if !ok || raw == nil {
			return ""
		}
		if idx == len(keys)-1 {
			if s, ok := raw.(string); ok {
				return s
			}
			return fmt.Sprint(raw)
		}
		next, ok := raw.(map[string]any)
		if !ok {
			return ""
		}
		cur = next
	}
	return ""
}
