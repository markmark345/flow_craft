package utils

import "encoding/json"

func MustJSON[T any](v T) string {
	b, _ := json.Marshal(v)
	return string(b)
}
