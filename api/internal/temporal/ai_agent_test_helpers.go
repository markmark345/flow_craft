package temporal

import "context"

func RenderPromptForTest(template string, input map[string]any, steps map[string]any) string {
	return renderPrompt(template, input, steps)
}

func ExtractOpenAITextForTest(raw any) string {
	return extractOpenAIText(raw)
}

func ExtractGeminiTextForTest(raw any) string {
	return extractGeminiText(raw)
}

func ReadFloatForTest(cfg map[string]any, key string, fallback float64) float64 {
	return readFloat(cfg, key, fallback)
}

func ResolveChatModelForTest(nodeType string, modelCfg map[string]any) (provider string, baseURL string, model string, apiKey string, err error) {
	return resolveChatModel(context.Background(), stepDependencies{}, nodeType, modelCfg)
}
