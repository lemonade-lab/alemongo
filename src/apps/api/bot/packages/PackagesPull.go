package botpackages

import (
	"github.com/gin-gonic/gin"
)

func PackagesPull(ctx *gin.Context) {
	Pull(ctx, false)
}
