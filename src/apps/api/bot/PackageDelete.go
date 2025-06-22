package bot

import "github.com/gin-gonic/gin"

func PackageDelete(ctx *gin.Context) {
	name := ctx.PostForm("name")

}
