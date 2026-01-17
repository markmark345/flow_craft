package utils

import (
	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/dto"
)

// JSONResponse sends a standardized success response
func JSONResponse(c *gin.Context, code int, data any) {
	c.JSON(code, dto.ResponseEnvelope[any]{
		Success: true,
		Data:    data,
		Error:   nil,
	})
}

// JSONError sends a standardized error response
func JSONError(c *gin.Context, code int, errCode string, message string, details any) {
	c.JSON(code, dto.ResponseEnvelope[any]{
		Success: false,
		Data:    nil,
		Error: &dto.ErrorBody{
			Code:    errCode,
			Message: message,
			Details: details,
		},
	})
}
