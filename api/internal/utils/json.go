package utils

import "encoding/json"

func MustJSON(v interface{}) string {
    b, _ := json.Marshal(v)
    return string(b)
}
