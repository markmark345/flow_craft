package dto

type ResponseEnvelope[T any] struct {
	Success bool       `json:"success"`
	Data    T          `json:"data,omitempty"`
	Meta    any        `json:"meta,omitempty"`
	Error   *ErrorBody `json:"error,omitempty"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}
