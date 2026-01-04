import { request } from '../base'

export interface Setting {
  key: string
  value: string
  category?: string
  version: number
  editable: boolean
  updatedBy?: string
}

export interface ImportResult {
  imported: number
  skipped: number
  failed: number
  total: number
  timestamp: number
}

/**
 * 导出配置
 * @param category 配置类别（可选，不传则导出全部）
 */
export const exportSettings = async (category?: string): Promise<Setting[]> => {
  const params = category ? { category } : {}
  const res = await request({ method: 'GET', url: '/settings/export', params })
  return res
}

/**
 * 导入配置
 * @param settings 配置列表
 * @param overwrite 是否覆盖已存在的配置
 */
export const importSettings = async (
  settings: Setting[],
  overwrite: boolean = false
): Promise<ImportResult> => {
  const res = await request({
    method: 'POST',
    url: '/settings/import',
    data: {
      settings,
      overwrite
    }
  })
  return res
}
