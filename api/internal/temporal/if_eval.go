package temporal

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type ifCondition struct {
	Type     string
	Operator string
	Left     string
	Right    string
}

func parseIfConfig(config map[string]any) (conds []ifCondition, combine string, ignoreCase bool, convertTypes bool) {
	combine = "AND"
	if raw := strings.ToUpper(strings.TrimSpace(readString(config, "combine"))); raw == "OR" {
		combine = "OR"
	}
	ignoreCase = readBool(config, "ignoreCase")
	convertTypes = readBool(config, "convertTypes")

	rawConds, ok := config["conditions"]
	if !ok || rawConds == nil {
		return nil, combine, ignoreCase, convertTypes
	}
	arr, ok := rawConds.([]any)
	if !ok {
		return nil, combine, ignoreCase, convertTypes
	}

	out := make([]ifCondition, 0, len(arr))
	for _, item := range arr {
		m, ok := item.(map[string]any)
		if !ok {
			continue
		}
		out = append(out, ifCondition{
			Type:     strings.ToLower(strings.TrimSpace(readAnyString(m["type"]))),
			Operator: strings.TrimSpace(readAnyString(m["operator"])),
			Left:     strings.TrimSpace(readAnyString(m["left"])),
			Right:    strings.TrimSpace(readAnyString(m["right"])),
		})
	}
	return out, combine, ignoreCase, convertTypes
}

func evaluateIfConditions(conds []ifCondition, combine string, ignoreCase bool, convertTypes bool, input map[string]any) (bool, error) {
	if strings.EqualFold(combine, "OR") {
		for _, c := range conds {
			ok, err := evaluateIfCondition(c, ignoreCase, convertTypes, input)
			if err != nil {
				return false, err
			}
			if ok {
				return true, nil
			}
		}
		return false, nil
	}

	for _, c := range conds {
		ok, err := evaluateIfCondition(c, ignoreCase, convertTypes, input)
		if err != nil {
			return false, err
		}
		if !ok {
			return false, nil
		}
	}
	return true, nil
}

func evaluateIfCondition(c ifCondition, ignoreCase bool, convertTypes bool, input map[string]any) (bool, error) {
	typ := strings.ToLower(strings.TrimSpace(c.Type))
	if typ == "" {
		typ = "string"
	}
	op := strings.ToLower(strings.TrimSpace(c.Operator))
	if op == "" {
		op = "is equal to"
	}

	left := resolveLeftOperand(c.Left, input)
	right := resolveRightOperand(c.Right, input)

	switch typ {
	case "number":
		return evalNumber(op, left, right, convertTypes)
	case "datetime", "date", "date & time":
		return evalDatetime(op, left, right, convertTypes)
	case "boolean":
		return evalBoolean(op, left, right, convertTypes)
	case "array":
		return evalArray(op, left, right, convertTypes, ignoreCase)
	case "object":
		return evalObject(op, left)
	default:
		return evalString(op, left, right, ignoreCase)
	}
}

func resolveLeftOperand(raw string, input map[string]any) any {
	trim := strings.TrimSpace(raw)
	if trim == "" {
		return nil
	}
	if strings.HasPrefix(trim, "{{") && strings.HasSuffix(trim, "}}") {
		path := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(trim, "{{"), "}}"))
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if strings.EqualFold(trim, "input") {
		return input
	}
	if strings.HasPrefix(trim, "input.") {
		path := strings.TrimPrefix(trim, "input.")
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if v, ok := getByPath(input, trim); ok {
		return v
	}
	return nil
}

func resolveRightOperand(raw string, input map[string]any) any {
	trim := strings.TrimSpace(raw)
	if trim == "" {
		return nil
	}
	if strings.HasPrefix(trim, "{{") && strings.HasSuffix(trim, "}}") {
		path := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(trim, "{{"), "}}"))
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	if strings.EqualFold(trim, "input") {
		return input
	}
	if strings.HasPrefix(trim, "input.") {
		path := strings.TrimPrefix(trim, "input.")
		if v, ok := getByPath(input, path); ok {
			return v
		}
		return nil
	}
	return trim
}

func evalString(op string, left any, right any, ignoreCase bool) (bool, error) {
	ls, lok := toString(left)
	rs, _ := toString(right)
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is empty":
		if !lok {
			return left == nil, nil
		}
		return strings.TrimSpace(ls) == "", nil
	case "is not empty":
		if !lok {
			return left != nil, nil
		}
		return strings.TrimSpace(ls) != "", nil
	}
	if ignoreCase {
		ls = strings.ToLower(ls)
		rs = strings.ToLower(rs)
	}
	switch op {
	case "is equal to":
		return ls == rs, nil
	case "is not equal to":
		return ls != rs, nil
	case "contains":
		return strings.Contains(ls, rs), nil
	case "does not contain":
		return !strings.Contains(ls, rs), nil
	case "starts with":
		return strings.HasPrefix(ls, rs), nil
	case "does not start with":
		return !strings.HasPrefix(ls, rs), nil
	case "ends with":
		return strings.HasSuffix(ls, rs), nil
	case "does not end with":
		return !strings.HasSuffix(ls, rs), nil
	case "matches regex":
		re, err := regexp.Compile(rs)
		if err != nil {
			return false, fmt.Errorf("invalid regex: %w", err)
		}
		return re.MatchString(ls), nil
	case "does not match regex":
		re, err := regexp.Compile(rs)
		if err != nil {
			return false, fmt.Errorf("invalid regex: %w", err)
		}
		return !re.MatchString(ls), nil
	default:
		return false, fmt.Errorf("unsupported string operator: %q", op)
	}
}

func evalNumber(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	lf, err := toFloat(left, convertTypes)
	if err != nil {
		return false, err
	}
	rf, err := toFloat(right, convertTypes)
	if err != nil {
		return false, err
	}

	switch op {
	case "is equal to":
		return lf == rf, nil
	case "is not equal to":
		return lf != rf, nil
	case "is greater than":
		return lf > rf, nil
	case "is less than":
		return lf < rf, nil
	case "is greater than or equal to":
		return lf >= rf, nil
	case "is less than or equal to":
		return lf <= rf, nil
	default:
		return false, fmt.Errorf("unsupported number operator: %q", op)
	}
}

func evalDatetime(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	lt, err := toTime(left, convertTypes)
	if err != nil {
		return false, err
	}
	rt, err := toTime(right, convertTypes)
	if err != nil {
		return false, err
	}

	switch op {
	case "is equal to":
		return lt.Equal(rt), nil
	case "is not equal to":
		return !lt.Equal(rt), nil
	case "is after":
		return lt.After(rt), nil
	case "is before":
		return lt.Before(rt), nil
	case "is after or equal to":
		return lt.After(rt) || lt.Equal(rt), nil
	case "is before or equal to":
		return lt.Before(rt) || lt.Equal(rt), nil
	default:
		return false, fmt.Errorf("unsupported datetime operator: %q", op)
	}
}

func evalBoolean(op string, left any, right any, convertTypes bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is true":
		b, err := toBool(left, convertTypes)
		return b && err == nil, err
	case "is false":
		b, err := toBool(left, convertTypes)
		return !b && err == nil, err
	}

	lb, err := toBool(left, convertTypes)
	if err != nil {
		return false, err
	}
	rb, err := toBool(right, convertTypes)
	if err != nil {
		return false, err
	}
	switch op {
	case "is equal to":
		return lb == rb, nil
	case "is not equal to":
		return lb != rb, nil
	default:
		return false, fmt.Errorf("unsupported boolean operator: %q", op)
	}
}

func evalArray(op string, left any, right any, convertTypes bool, ignoreCase bool) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	}

	arr, err := toSlice(left, convertTypes)
	if err != nil {
		return false, err
	}
	switch op {
	case "is empty":
		return len(arr) == 0, nil
	case "is not empty":
		return len(arr) > 0, nil
	}

	if strings.HasPrefix(op, "length ") {
		rn, err := toInt(right, convertTypes)
		if err != nil {
			return false, err
		}
		switch op {
		case "length equal to":
			return len(arr) == rn, nil
		case "length not equal to":
			return len(arr) != rn, nil
		case "length greater than":
			return len(arr) > rn, nil
		case "length less than":
			return len(arr) < rn, nil
		case "length greater than or equal to":
			return len(arr) >= rn, nil
		case "length less than or equal to":
			return len(arr) <= rn, nil
		default:
			return false, fmt.Errorf("unsupported array operator: %q", op)
		}
	}

	rs, _ := toString(right)
	if ignoreCase {
		rs = strings.ToLower(rs)
	}

	contains := false
	for _, item := range arr {
		ls, _ := toString(item)
		if ignoreCase {
			ls = strings.ToLower(ls)
		}
		if ls == rs {
			contains = true
			break
		}
	}

	switch op {
	case "contains":
		return contains, nil
	case "does not contain":
		return !contains, nil
	default:
		return false, fmt.Errorf("unsupported array operator: %q", op)
	}
}

func evalObject(op string, left any) (bool, error) {
	switch op {
	case "exists":
		return left != nil, nil
	case "does not exist":
		return left == nil, nil
	case "is empty":
		m, ok := left.(map[string]any)
		if !ok {
			return left == nil, nil
		}
		return len(m) == 0, nil
	case "is not empty":
		m, ok := left.(map[string]any)
		if !ok {
			return left != nil, nil
		}
		return len(m) > 0, nil
	default:
		return false, fmt.Errorf("unsupported object operator: %q", op)
	}
}

func toString(v any) (string, bool) {
	if v == nil {
		return "", false
	}
	switch t := v.(type) {
	case string:
		return t, true
	case []byte:
		return string(t), true
	default:
		return fmt.Sprint(v), true
	}
}

func toFloat(v any, convertTypes bool) (float64, error) {
	if v == nil {
		return 0, fmt.Errorf("missing number")
	}
	switch t := v.(type) {
	case float64:
		return t, nil
	case float32:
		return float64(t), nil
	case int:
		return float64(t), nil
	case int64:
		return float64(t), nil
	case json.Number:
		return t.Float64()
	case string:
		if !convertTypes {
			return 0, fmt.Errorf("expected number, got string")
		}
		return strconv.ParseFloat(strings.TrimSpace(t), 64)
	default:
		if !convertTypes {
			return 0, fmt.Errorf("expected number, got %T", v)
		}
		return strconv.ParseFloat(strings.TrimSpace(fmt.Sprint(v)), 64)
	}
}

func toInt(v any, convertTypes bool) (int, error) {
	f, err := toFloat(v, convertTypes)
	if err != nil {
		return 0, err
	}
	return int(f), nil
}

func toBool(v any, convertTypes bool) (bool, error) {
	if v == nil {
		return false, fmt.Errorf("missing boolean")
	}
	switch t := v.(type) {
	case bool:
		return t, nil
	case string:
		if !convertTypes {
			return false, fmt.Errorf("expected boolean, got string")
		}
		switch strings.ToLower(strings.TrimSpace(t)) {
		case "true", "1", "yes", "y", "on":
			return true, nil
		case "false", "0", "no", "n", "off":
			return false, nil
		default:
			return false, fmt.Errorf("invalid boolean %q", t)
		}
	default:
		if !convertTypes {
			return false, fmt.Errorf("expected boolean, got %T", v)
		}
		return toBool(fmt.Sprint(v), true)
	}
}

func toTime(v any, convertTypes bool) (time.Time, error) {
	if v == nil {
		return time.Time{}, fmt.Errorf("missing datetime")
	}
	switch t := v.(type) {
	case time.Time:
		return t, nil
	case string:
		s := strings.TrimSpace(t)
		if s == "" {
			return time.Time{}, fmt.Errorf("missing datetime")
		}
		if parsed, err := time.Parse(time.RFC3339Nano, s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse(time.RFC3339, s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02 15:04:05", s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02 15:04", s); err == nil {
			return parsed, nil
		}
		if parsed, err := time.Parse("2006-01-02", s); err == nil {
			return parsed, nil
		}
		if convertTypes {
			if num, err := strconv.ParseInt(s, 10, 64); err == nil {
				return time.Unix(num, 0).UTC(), nil
			}
		}
		return time.Time{}, fmt.Errorf("invalid datetime %q", s)
	default:
		if !convertTypes {
			return time.Time{}, fmt.Errorf("expected datetime, got %T", v)
		}
		return toTime(fmt.Sprint(v), true)
	}
}

func toSlice(v any, convertTypes bool) ([]any, error) {
	if v == nil {
		return nil, fmt.Errorf("missing array")
	}
	switch t := v.(type) {
	case []any:
		return t, nil
	case []string:
		out := make([]any, 0, len(t))
		for _, s := range t {
			out = append(out, s)
		}
		return out, nil
	case string:
		if !convertTypes {
			return nil, fmt.Errorf("expected array, got string")
		}
		var out []any
		if err := json.Unmarshal([]byte(strings.TrimSpace(t)), &out); err != nil {
			return nil, fmt.Errorf("invalid array json: %w", err)
		}
		return out, nil
	default:
		return nil, fmt.Errorf("expected array, got %T", v)
	}
}
