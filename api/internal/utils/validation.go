package utils

import "errors"

func ValidateRequired(value string, field string) error {
    if value == "" {
        return errors.New(field + " is required")
    }
    return nil
}
