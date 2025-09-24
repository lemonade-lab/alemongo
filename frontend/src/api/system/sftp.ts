import { request } from '@/api/base'

export const sftpInfo = () => request({ method: 'GET', url: '/sftp/info' })

export const sftpList = (path = '.') =>
  request({ method: 'GET', url: '/sftp/list', params: { path } })

export const sftpRead = (path: string) =>
  request({ method: 'GET', url: '/sftp/read', params: { path } })

export const sftpDownloadUrl = (path: string) =>
  `/api/v1/sftp/download?path=${encodeURIComponent(path)}`

export const sftpZipUrl = (path: string) =>
  `/api/v1/sftp/zip?path=${encodeURIComponent(path)}`

export const sftpUpload = (dir: string, file: File, overwrite = false) => {
  const form = new FormData()
  form.append('path', dir)
  form.append('file', file)
  if (overwrite) form.append('overwrite', '1')
  return request({
    method: 'POST',
    url: '/sftp/upload',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const sftpWrite = (path: string, content: string) =>
  request({ method: 'POST', url: '/sftp/write', data: { path, content } })

export const sftpMkdir = (path: string) =>
  request({ method: 'POST', url: '/sftp/mkdir', data: { path } })

export const sftpRename = (old_path: string, new_path: string) =>
  request({ method: 'POST', url: '/sftp/rename', data: { old_path, new_path } })

export const sftpDelete = (path: string, recursive = false) =>
  request({
    method: 'DELETE',
    url: '/sftp/delete',
    params: { path, recursive: recursive ? 1 : 0 }
  })

export const sftpZipBatch = (paths: string[]) =>
  request({
    method: 'POST',
    url: '/sftp/zip-batch',
    data: { paths },
    responseType: 'blob' as unknown as 'json'
  })

export const sftpCopy = (old_path: string, new_path: string) =>
  request({ method: 'POST', url: '/sftp/copy', data: { old_path, new_path } })

export const sftpDeleteBatch = (paths: string[], recursive = false) =>
  request({
    method: 'POST',
    url: '/sftp/delete-batch',
    data: { paths, recursive }
  })
