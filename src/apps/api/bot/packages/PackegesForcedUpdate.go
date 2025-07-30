package botpackages

import (
	"github.com/gin-gonic/gin"
)

func PackegesForcedUpdate(ctx *gin.Context) {
	Pull(ctx, true)
}
