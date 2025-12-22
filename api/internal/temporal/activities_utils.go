package temporal

import (
	"fmt"
	"strings"
)

func readBool(cfg map[string]any, key string) bool {
	if cfg == nil {
		return false
	}
	raw, ok := cfg[key]
	if !ok || raw == nil {
		return false
	}
	if v, ok := raw.(bool); ok {
		return v
	}
	if s, ok := raw.(string); ok {
		switch strings.ToLower(strings.TrimSpace(s)) {
		case "true", "1", "yes", "y", "on":
			return true
		default:
			return false
		}
	}
	return false
}

func readNestedBool(root map[string]any, keys ...string) bool {
	if root == nil {
		return false
	}
	cur := root
	for idx, key := range keys {
		raw, ok := cur[key]
		if !ok {
			return false
		}
		if idx == len(keys)-1 {
			if v, ok := raw.(bool); ok {
				return v
			}
			if v, ok := raw.(string); ok {
				return strings.EqualFold(strings.TrimSpace(v), "true")
			}
			return strings.EqualFold(strings.TrimSpace(fmt.Sprint(raw)), "true")
		}
		next, ok := raw.(map[string]any)
		if !ok {
			return false
		}
		cur = next
	}
	return false
}

func getByPath(root map[string]any, path string) (any, bool) {
	if root == nil {
		return nil, false
	}
	if strings.TrimSpace(path) == "" {
		return root, true
	}
	parts := strings.Split(path, ".")
	var cur any = root
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		m, ok := cur.(map[string]any)
		if !ok {
			return nil, false
		}
		v, ok := m[p]
		if !ok {
			return nil, false
		}
		cur = v
	}
	return cur, true
}

func readAnyString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}

func readString(cfg map[string]any, key string) string {
	if cfg == nil {
		return ""
	}
	v, ok := cfg[key]
	if !ok || v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprint(v)
}

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
