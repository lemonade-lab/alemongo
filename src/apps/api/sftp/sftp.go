package sftp

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/settings"
	"archive/zip"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var baseRoot string

func init() {
	// Default to OS root so SFTP can access full filesystem like terminal
	// Still protected by auth/permission middlewares and path safety check
	abs, err := filepath.Abs(string(os.PathSeparator))
	if err != nil || abs == "" {
		baseRoot = "/"
	} else {
		baseRoot = abs
	}
}

// resolveSafe joins the provided relative path with baseRoot and ensures it stays within baseRoot.
func resolveSafe(rel string) (string, error) {
	p := rel
	// Clean and strip potential leading separators to treat as relative
	p = filepath.Clean(p)
	if filepath.IsAbs(p) {
		// make absolute input relative to root
		p = strings.TrimPrefix(p, string(filepath.Separator))
	}
	// Special cases for "." or empty
	if p == "." || p == "" {
		return baseRoot, nil
	}
	joined := filepath.Join(baseRoot, p)
	abs, err := filepath.Abs(joined)
	if err != nil {
		return "", err
	}
	// Ensure the path is inside baseRoot
	// Add separator to avoid prefix trick (e.g., /workA vs /work)
	br := baseRoot
	if !strings.HasSuffix(br, string(filepath.Separator)) {
		br = br + string(filepath.Separator)
	}
	if abs != baseRoot && !strings.HasPrefix(abs, br) {
		return "", errors.New("path escapes base root")
	}
	return abs, nil
}

type FileEntry struct {
	Name    string    `json:"name"`
	Path    string    `json:"path"`
	IsDir   bool      `json:"is_dir"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"mod_time"`
}

// List directory contents
func List(ctx *gin.Context) {
	rel := ctx.Query("path")
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	fi, err := os.Stat(abs)
	if err != nil {
		code := http.StatusBadRequest
		if os.IsNotExist(err) {
			code = http.StatusNotFound
		}
		response.ResponseErrorWithMsg(ctx, code, response.ResCode(code), err.Error())
		return
	}
	if !fi.IsDir() {
		// If it's file, return info as single entry
		entry := FileEntry{Name: filepath.Base(abs), Path: rel, IsDir: false, Size: fi.Size(), ModTime: fi.ModTime()}
		ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"entries": []FileEntry{entry}, "root": baseRoot}})
		return
	}
	f, err := os.ReadDir(abs)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	entries := make([]FileEntry, 0, len(f))
	for _, e := range f {
		info, err := e.Info()
		if err != nil {
			continue
		}
		// compute relative path for client
		relPath := strings.TrimPrefix(strings.TrimPrefix(filepath.Join(rel, e.Name()), string(filepath.Separator)), "./")
		entries = append(entries, FileEntry{
			Name:    e.Name(),
			Path:    relPath,
			IsDir:   e.IsDir(),
			Size:    info.Size(),
			ModTime: info.ModTime(),
		})
	}
	// sort: dirs first then files, name asc
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir != entries[j].IsDir {
			return entries[i].IsDir && !entries[j].IsDir
		}
		return strings.ToLower(entries[i].Name) < strings.ToLower(entries[j].Name)
	})
	ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"entries": entries, "root": baseRoot}})
}

// Read small text file (for editing). Limit size to avoid memory pressure.
func Read(ctx *gin.Context) {
	rel := ctx.Query("path")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	fi, err := os.Stat(abs)
	if err != nil {
		code := http.StatusBadRequest
		if os.IsNotExist(err) {
			code = http.StatusNotFound
		}
		response.ResponseErrorWithMsg(ctx, code, response.ResCode(code), err.Error())
		return
	}
	if fi.IsDir() {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "该路径是目录")
		return
	}
	// size limit (default 2MB)
	max := int64(2 * 1024 * 1024)
	if fi.Size() > max {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "文件过大，无法直接读取，请下载")
		return
	}
	data, err := os.ReadFile(abs)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{
		"name":     filepath.Base(abs),
		"path":     rel,
		"size":     fi.Size(),
		"mod_time": fi.ModTime(),
		"content":  string(data),
	}})
}

// Download a file
func Download(ctx *gin.Context) {
	rel := ctx.Query("path")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	fi, err := os.Stat(abs)
	if err != nil {
		code := http.StatusBadRequest
		if os.IsNotExist(err) {
			code = http.StatusNotFound
		}
		response.ResponseErrorWithMsg(ctx, code, response.ResCode(code), err.Error())
		return
	}
	if fi.IsDir() {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "目录不支持下载")
		return
	}
	ctx.FileAttachment(abs, filepath.Base(abs))
}

// Zip a file or directory and stream to client
func Zip(ctx *gin.Context) {
	rel := ctx.Query("path")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	fi, err := os.Stat(abs)
	if err != nil {
		code := http.StatusBadRequest
		if os.IsNotExist(err) {
			code = http.StatusNotFound
		}
		response.ResponseErrorWithMsg(ctx, code, response.ResCode(code), err.Error())
		return
	}
	base := filepath.Base(abs)
	if base == "." || base == string(filepath.Separator) || base == "" {
		base = "root"
	}
	filename := base + ".zip"
	ctx.Header("Content-Type", "application/zip")
	ctx.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")

	zw := zip.NewWriter(ctx.Writer)
	defer zw.Close()

	addFile := func(path string, relInZip string, info fs.FileInfo) error {
		hdr, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		hdr.Name = relInZip
		if info.IsDir() {
			hdr.Name += "/"
		}
		w, err := zw.CreateHeader(hdr)
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()
		_, err = io.Copy(w, f)
		return err
	}

	if fi.IsDir() {
		rootParent := filepath.Dir(abs)
		err = filepath.WalkDir(abs, func(p string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			info, err := d.Info()
			if err != nil {
				return err
			}
			relZip := strings.TrimPrefix(p, rootParent+string(filepath.Separator))
			return addFile(p, relZip, info)
		})
		if err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
			return
		}
	} else {
		if err := addFile(abs, base, fi); err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
			return
		}
	}
}

type pathsReq struct {
	Paths []string `json:"paths"`
}

// Zip multiple paths into one archive
func ZipBatch(ctx *gin.Context) {
	var req pathsReq
	if err := ctx.ShouldBindJSON(&req); err != nil || len(req.Paths) == 0 {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少paths参数")
		return
	}
	ctx.Header("Content-Type", "application/zip")
	ctx.Header("Content-Disposition", "attachment; filename=\"selection.zip\"")
	zw := zip.NewWriter(ctx.Writer)
	defer zw.Close()

	for _, rel := range req.Paths {
		abs, err := resolveSafe(rel)
		if err != nil {
			continue
		}
		fi, err := os.Stat(abs)
		if err != nil {
			continue
		}
		base := filepath.Base(abs)
		if fi.IsDir() {
			err = filepath.WalkDir(abs, func(p string, d fs.DirEntry, err error) error {
				if err != nil {
					return err
				}
				info, err := d.Info()
				if err != nil {
					return err
				}
				relZip := filepath.Join(base, strings.TrimPrefix(p, abs))
				if relZip == base {
					relZip = base + "/"
				}
				hdr, err := zip.FileInfoHeader(info)
				if err != nil {
					return err
				}
				hdr.Name = strings.TrimPrefix(relZip, string(filepath.Separator))
				if info.IsDir() {
					hdr.Name += "/"
				}
				w, err := zw.CreateHeader(hdr)
				if err != nil {
					return err
				}
				if info.IsDir() {
					return nil
				}
				f, err := os.Open(p)
				if err != nil {
					return err
				}
				defer f.Close()
				_, err = io.Copy(w, f)
				return err
			})
			if err != nil {
				continue
			}
		} else {
			hdr, err := zip.FileInfoHeader(fi)
			if err != nil {
				continue
			}
			hdr.Name = base
			w, err := zw.CreateHeader(hdr)
			if err != nil {
				continue
			}
			f, err := os.Open(abs)
			if err != nil {
				continue
			}
			_, _ = io.Copy(w, f)
			f.Close()
		}
	}
}

// Copy file or directory
func Copy(ctx *gin.Context) {
	oldRel := ctx.PostForm("old_path")
	newRel := ctx.PostForm("new_path")
	if oldRel == "" || newRel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少参数")
		return
	}
	src, err := resolveSafe(oldRel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	dst, err := resolveSafe(newRel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	info, err := os.Stat(src)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	if info.IsDir() {
		err = copyDir(src, dst)
	} else {
		if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
			return
		}
		err = copyFile(src, dst)
	}
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"old_path": oldRel, "new_path": newRel})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	if fi, err := os.Stat(src); err == nil {
		_ = os.Chmod(dst, fi.Mode())
	}
	return nil
}

func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		target := filepath.Join(dst, rel)
		if d.IsDir() {
			return os.MkdirAll(target, 0755)
		}
		return copyFile(p, target)
	})
}

// Delete batch
func DeleteBatch(ctx *gin.Context) {
	var req struct {
		Paths     []string `json:"paths"`
		Recursive bool     `json:"recursive"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil || len(req.Paths) == 0 {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少paths参数")
		return
	}
	for _, rel := range req.Paths {
		abs, err := resolveSafe(rel)
		if err != nil {
			continue
		}
		st, err := os.Stat(abs)
		if err != nil {
			continue
		}
		if st.IsDir() {
			if req.Recursive {
				_ = os.RemoveAll(abs)
			} else {
				_ = os.Remove(abs)
			}
		} else {
			_ = os.Remove(abs)
		}
	}
	response.ResponseSuccess(ctx, gin.H{"deleted": len(req.Paths)})
}

// Upload a file (multipart/form-data). Field name: file; path (dir) as form field
func Upload(ctx *gin.Context) {
	dirRel := ctx.PostForm("path")
	if dirRel == "" {
		dirRel = "."
	}
	dirAbs, err := resolveSafe(dirRel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	if st, err := os.Stat(dirAbs); err != nil || !st.IsDir() {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "上传路径不是有效目录")
		return
	}
	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少文件")
		return
	}
	defer file.Close()
	// optional overwrite flag
	overwrite := ctx.PostForm("overwrite") == "1"
	target := filepath.Join(dirAbs, header.Filename)
	if _, err := os.Stat(target); err == nil && !overwrite {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "文件已存在，请设置覆盖或重命名")
		return
	}
	out, err := os.Create(target)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"name": header.Filename})
}

// Write text file content (create or overwrite)
func Write(ctx *gin.Context) {
	rel := ctx.PostForm("path")
	content := ctx.PostForm("content")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	// ensure parent exists
	if err := os.MkdirAll(filepath.Dir(abs), 0755); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	if err := os.WriteFile(abs, []byte(content), 0644); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"path": rel})
}

// Mkdir creates directory (recursive)
func Mkdir(ctx *gin.Context) {
	rel := ctx.PostForm("path")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	if err := os.MkdirAll(abs, 0755); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"path": rel})
}

// Rename or move within baseRoot
func Rename(ctx *gin.Context) {
	oldRel := ctx.PostForm("old_path")
	newRel := ctx.PostForm("new_path")
	if oldRel == "" || newRel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少参数")
		return
	}
	oldAbs, err := resolveSafe(oldRel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	newAbs, err := resolveSafe(newRel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	// Ensure target's parent exists
	if err := os.MkdirAll(filepath.Dir(newAbs), 0755); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	if err := os.Rename(oldAbs, newAbs); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"old_path": oldRel, "new_path": newRel})
}

// Delete file or directory (recursive if query recursive=1)
func Delete(ctx *gin.Context) {
	rel := ctx.Query("path")
	if rel == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少path参数")
		return
	}
	abs, err := resolveSafe(rel)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	recursive := ctx.Query("recursive") == "1"
	st, err := os.Stat(abs)
	if err != nil {
		code := http.StatusBadRequest
		if os.IsNotExist(err) {
			code = http.StatusNotFound
		}
		response.ResponseErrorWithMsg(ctx, code, response.ResCode(code), err.Error())
		return
	}
	if st.IsDir() {
		if recursive {
			if err := os.RemoveAll(abs); err != nil {
				response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
				return
			}
		} else {
			if err := os.Remove(abs); err != nil {
				response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
				return
			}
		}
	} else {
		if err := os.Remove(abs); err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
			return
		}
	}
	response.ResponseSuccess(ctx, gin.H{"path": rel})
}

// Helper endpoint: returns base root and server info
func Info(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{
		"root":   baseRoot,
		"server": settings.Conf.Server,
	}})
}
