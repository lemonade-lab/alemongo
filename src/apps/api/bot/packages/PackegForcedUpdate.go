package botpackages

import (
	"github.com/gin-gonic/gin"
)

func PackegForcedUpdate(ctx *gin.Context) {
	Pull(ctx, true)
}
