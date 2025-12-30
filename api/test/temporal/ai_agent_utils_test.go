package temporal_test

import (
	"testing"

	temporal "flowcraft-api/internal/temporal"
)

func TestRenderPrompt(t *testing.T) {
	t.Parallel()

	t.Run("replaces input", func(t *testing.T) {
		t.Parallel()

		got := temporal.RenderPromptForTest("Hello {{input}}", map[string]any{"a": 1}, nil)
		if got != "Hello {\"a\":1}" {
			t.Fatalf("unexpected: %q", got)
		}
	})

	t.Run("replaces steps", func(t *testing.T) {
		t.Parallel()

		got := temporal.RenderPromptForTest("Steps: {{steps}}", nil, map[string]any{"node_abc": map[string]any{"status": 200}})
		if got != "Steps: {\"node_abc\":{\"status\":200}}" {
			t.Fatalf("unexpected: %q", got)
		}
	})

	t.Run("no placeholders", func(t *testing.T) {
		t.Parallel()

		got := temporal.RenderPromptForTest("plain", map[string]any{"a": 1}, map[string]any{"b": 2})
		if got != "plain" {
			t.Fatalf("unexpected: %q", got)
		}
	})
}

func TestExtractOpenAIText(t *testing.T) {
	t.Parallel()

	raw := map[string]any{
		"choices": []any{
			map[string]any{
				"message": map[string]any{
					"content": "hello",
				},
			},
		},
	}
	if got := temporal.ExtractOpenAITextForTest(raw); got != "hello" {
		t.Fatalf("unexpected: %q", got)
	}
}

func TestExtractGeminiText(t *testing.T) {
	t.Parallel()

	raw := map[string]any{
		"candidates": []any{
			map[string]any{
				"content": map[string]any{
					"parts": []any{
						map[string]any{"text": "Hello"},
						map[string]any{"text": "World"},
					},
				},
			},
		},
	}
	if got := temporal.ExtractGeminiTextForTest(raw); got != "Hello\nWorld" {
		t.Fatalf("unexpected: %q", got)
	}
}

func TestReadFloat(t *testing.T) {
	t.Parallel()

	cfg := map[string]any{
		"float": 0.25,
		"int":   2,
		"str":   " 0.5 ",
		"bad":   "abc",
	}
	if got := temporal.ReadFloatForTest(cfg, "float", 0.7); got != 0.25 {
		t.Fatalf("expected 0.25, got %v", got)
	}
	if got := temporal.ReadFloatForTest(cfg, "int", 0.7); got != 2 {
		t.Fatalf("expected 2, got %v", got)
	}
	if got := temporal.ReadFloatForTest(cfg, "str", 0.7); got != 0.5 {
		t.Fatalf("expected 0.5, got %v", got)
	}
	if got := temporal.ReadFloatForTest(cfg, "bad", 0.7); got != 0.7 {
		t.Fatalf("expected fallback 0.7, got %v", got)
	}
}

func TestResolveChatModel(t *testing.T) {
	t.Parallel()

	t.Run("chatModel openai defaults base url", func(t *testing.T) {
		t.Parallel()

		provider, baseURL, model, apiKey, err := temporal.ResolveChatModelForTest("chatModel", map[string]any{
			"provider": "openai",
			"model":    "gpt-4o-mini",
			"apiKey":   "sk-test",
			"baseUrl":  "",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if provider != "openai" {
			t.Fatalf("expected provider openai, got %q", provider)
		}
		if baseURL != "https://api.openai.com/v1" {
			t.Fatalf("expected default baseURL, got %q", baseURL)
		}
		if model != "gpt-4o-mini" {
			t.Fatalf("expected model gpt-4o-mini, got %q", model)
		}
		if apiKey != "sk-test" {
			t.Fatalf("expected apiKey sk-test, got %q", apiKey)
		}
	})

	t.Run("chatModel gemini defaults base url", func(t *testing.T) {
		t.Parallel()

		provider, baseURL, model, apiKey, err := temporal.ResolveChatModelForTest("chatModel", map[string]any{
			"provider": "gemini",
			"model":    "gemini-1.5-flash",
			"apiKey":   "AIza-test",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if provider != "gemini" {
			t.Fatalf("expected provider gemini, got %q", provider)
		}
		if baseURL != "https://generativelanguage.googleapis.com" {
			t.Fatalf("expected default baseURL, got %q", baseURL)
		}
		if model != "gemini-1.5-flash" {
			t.Fatalf("expected model gemini-1.5-flash, got %q", model)
		}
		if apiKey != "AIza-test" {
			t.Fatalf("expected apiKey AIza-test, got %q", apiKey)
		}
	})

	t.Run("chatModel grok defaults base url", func(t *testing.T) {
		t.Parallel()

		provider, baseURL, model, apiKey, err := temporal.ResolveChatModelForTest("chatModel", map[string]any{
			"provider": "grok",
			"model":    "grok-2-latest",
			"apiKey":   "xai-test",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if provider != "grok" {
			t.Fatalf("expected provider grok, got %q", provider)
		}
		if baseURL != "https://api.x.ai/v1" {
			t.Fatalf("expected default baseURL, got %q", baseURL)
		}
		if model != "grok-2-latest" {
			t.Fatalf("expected model grok-2-latest, got %q", model)
		}
		if apiKey != "xai-test" {
			t.Fatalf("expected apiKey xai-test, got %q", apiKey)
		}
	})

	t.Run("legacy openaiChatModel still works", func(t *testing.T) {
		t.Parallel()

		provider, baseURL, model, apiKey, err := temporal.ResolveChatModelForTest("openaiChatModel", map[string]any{
			"model":  "gpt-4o-mini",
			"apiKey": "sk-test",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if provider != "openai" {
			t.Fatalf("expected provider openai, got %q", provider)
		}
		if baseURL != "https://api.openai.com/v1" {
			t.Fatalf("expected default baseURL, got %q", baseURL)
		}
		if model != "gpt-4o-mini" {
			t.Fatalf("expected model gpt-4o-mini, got %q", model)
		}
		if apiKey != "sk-test" {
			t.Fatalf("expected apiKey sk-test, got %q", apiKey)
		}
	})
}
