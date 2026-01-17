package httpadapter

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"flowcraft-api/internal/utils"
)

func HealthHandler(c *gin.Context) {
	utils.JSONResponse(c, http.StatusOK, "ok")
}
