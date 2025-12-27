package handlers

import "strings"

func sanitizeReturnTo(value string, fallback string) string {
	fallback = strings.TrimSpace(fallback)
	if fallback == "" {
		fallback = "/"
	}
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	if strings.HasPrefix(value, "http://") || strings.HasPrefix(value, "https://") {
		return fallback
	}
	if !strings.HasPrefix(value, "/") {
		return fallback
	}
	return value
}
