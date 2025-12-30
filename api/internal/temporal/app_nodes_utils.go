package temporal

import (
	"fmt"
	"strings"
)

func readInt(cfg map[string]any, key string) int {
	if cfg == nil {
		return 0
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return 0
	}
	switch v := raw.(type) {
	case int:
		return v
	case int32:
		return int(v)
	case int64:
		return int(v)
	case float64:
		return int(v)
	case float32:
		return int(v)
	case string:
		trim := strings.TrimSpace(v)
		if trim == "" {
			return 0
		}
		var out int
		_, _ = fmt.Sscanf(trim, "%d", &out)
		return out
	default:
		var out int
		_, _ = fmt.Sscanf(fmt.Sprint(v), "%d", &out)
		return out
	}
}

func ReadIntForTest(cfg map[string]any, key string) int {
	return readInt(cfg, key)
}
