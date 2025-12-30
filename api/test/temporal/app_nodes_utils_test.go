package temporal_test

import (
	"context"
	"testing"

	temporal "flowcraft-api/internal/temporal"
)

func TestReadInt(t *testing.T) {
	t.Parallel()

	t.Run("nil cfg", func(t *testing.T) {
		t.Parallel()
		if got := temporal.ReadIntForTest(nil, "x"); got != 0 {
			t.Fatalf("expected 0, got %d", got)
		}
	})

	t.Run("missing key", func(t *testing.T) {
		t.Parallel()
		if got := temporal.ReadIntForTest(map[string]any{}, "x"); got != 0 {
			t.Fatalf("expected 0, got %d", got)
		}
	})

	t.Run("ints", func(t *testing.T) {
		t.Parallel()

		cfg := map[string]any{
			"int":     12,
			"int32":   int32(7),
			"int64":   int64(9),
			"float":   float64(3.9),
			"float32": float32(4.2),
		}
		if got := temporal.ReadIntForTest(cfg, "int"); got != 12 {
			t.Fatalf("expected 12, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "int32"); got != 7 {
			t.Fatalf("expected 7, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "int64"); got != 9 {
			t.Fatalf("expected 9, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "float"); got != 3 {
			t.Fatalf("expected 3, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "float32"); got != 4 {
			t.Fatalf("expected 4, got %d", got)
		}
	})

	t.Run("strings", func(t *testing.T) {
		t.Parallel()

		cfg := map[string]any{
			"spaces": "  42  ",
			"empty":  "   ",
			"mixed":  "12x",
			"bad":    "abc",
		}
		if got := temporal.ReadIntForTest(cfg, "spaces"); got != 42 {
			t.Fatalf("expected 42, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "empty"); got != 0 {
			t.Fatalf("expected 0, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "mixed"); got != 12 {
			t.Fatalf("expected 12, got %d", got)
		}
		if got := temporal.ReadIntForTest(cfg, "bad"); got != 0 {
			t.Fatalf("expected 0, got %d", got)
		}
	})

	t.Run("fallback types", func(t *testing.T) {
		t.Parallel()

		cfg := map[string]any{"bool": true}
		if got := temporal.ReadIntForTest(cfg, "bool"); got != 0 {
			t.Fatalf("expected 0, got %d", got)
		}
	})
}

func TestParseSheetValues(t *testing.T) {
	t.Parallel()

	t.Run("missing values", func(t *testing.T) {
		t.Parallel()

		_, err := temporal.ParseSheetValuesForTest(map[string]any{})
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("empty slice", func(t *testing.T) {
		t.Parallel()

		_, err := temporal.ParseSheetValuesForTest(map[string]any{"values": []any{}})
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("any slice passthrough", func(t *testing.T) {
		t.Parallel()

		values := []any{"a", 1}
		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": values})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 2 || got[0] != "a" || got[1] != 1 {
			t.Fatalf("unexpected values: %#v", got)
		}
	})

	t.Run("string slice converted", func(t *testing.T) {
		t.Parallel()

		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": []string{"a", "b"}})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 2 || got[0] != "a" || got[1] != "b" {
			t.Fatalf("unexpected values: %#v", got)
		}
	})

	t.Run("json array string", func(t *testing.T) {
		t.Parallel()

		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": `["a","b"]`})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 2 || got[0] != "a" || got[1] != "b" {
			t.Fatalf("unexpected values: %#v", got)
		}
	})

	t.Run("comma separated", func(t *testing.T) {
		t.Parallel()

		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": "a, b ,c"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 3 || got[0] != "a" || got[1] != "b" || got[2] != "c" {
			t.Fatalf("unexpected values: %#v", got)
		}
	})

	t.Run("single string", func(t *testing.T) {
		t.Parallel()

		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": "hello"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 1 || got[0] != "hello" {
			t.Fatalf("unexpected values: %#v", got)
		}
	})

	t.Run("other type stringified", func(t *testing.T) {
		t.Parallel()

		got, err := temporal.ParseSheetValuesForTest(map[string]any{"values": 123})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(got) != 1 || got[0] != "123" {
			t.Fatalf("unexpected values: %#v", got)
		}
	})
}

func TestExecuteApp_ActionInference(t *testing.T) {
	t.Parallel()

	ctx := context.Background()

	t.Run("gmail inferred from action", func(t *testing.T) {
		t.Parallel()

		_, logText, err := temporal.ExecuteAppForTest(ctx, map[string]any{"action": "gmail.sendEmail"})
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
		if logText != "missing credential" {
			t.Fatalf("expected log 'missing credential', got %q", logText)
		}
		if err.Error() != "gmail: credentialId is required" {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("gsheets inferred from action", func(t *testing.T) {
		t.Parallel()

		_, logText, err := temporal.ExecuteAppForTest(ctx, map[string]any{"action": "gsheets.appendRow"})
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
		if logText != "missing credential" {
			t.Fatalf("expected log 'missing credential', got %q", logText)
		}
		if err.Error() != "gsheets: credentialId is required" {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("github inferred from action", func(t *testing.T) {
		t.Parallel()

		_, logText, err := temporal.ExecuteAppForTest(ctx, map[string]any{"action": "github.createIssue"})
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
		if logText != "missing credential" {
			t.Fatalf("expected log 'missing credential', got %q", logText)
		}
		if err.Error() != "github: credentialId is required" {
			t.Fatalf("unexpected error: %v", err)
		}
	})
}
