import { request } from '../base'

// 流水线相关类型定义
export interface PipelineStep {
  name: string
  type: 'update_app' | 'restart_bot' | 'custom_command'
  config: Record<string, string | boolean>
  when: 'always' | 'on_success' | 'on_failure'
}

export interface WebhookConfig {
  enabled: boolean
  secret: string
}

export interface PipelineConfig {
  steps: PipelineStep[]
  webhook?: WebhookConfig
}

export interface Pipeline {
  id: number
  name: string
  description: string
  repository: string
  branch: string
  event_type: string
  is_active: boolean
  config: PipelineConfig
  created_by: string
  created_at: string
  updated_at: string
}

export interface PipelineStepExecution {
  id: number
  execution_id: number
  step_name: string
  step_type: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  config: Record<string, string | boolean>
  started_at?: string
  finished_at?: string
  logs: string
  error_msg: string
  order: number
  created_at: string
  updated_at: string
}

export interface PipelineExecution {
  id: number
  pipeline_id: number
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  triggered_by: string
  commit_hash: string
  commit_msg: string
  branch: string
  started_at?: string
  finished_at?: string
  logs: string
  error_msg: string
  steps: PipelineStepExecution[]
  created_at: string
  updated_at: string
}

export interface CreatePipelineRequest {
  name: string
  description?: string
  repository: string
  branch: string
  event_type: string
  config: PipelineConfig
}

export interface UpdatePipelineRequest {
  name?: string
  description?: string
  repository?: string
  branch?: string
  event_type?: string
  is_active?: boolean
  config?: PipelineConfig
}

// API 函数
export const apiGetPipelines = async (
  limit = 20,
  offset = 0
): Promise<Pipeline[]> => {
  const res = await request({
    url: `/pipeline?limit=${limit}&offset=${offset}`,
    method: 'GET'
  })
  const { data } = res as { code: number; msg: string; data: Pipeline[] }
  return data
}

export const apiGetPipeline = async (id: number): Promise<Pipeline> => {
  const res = await request({
    url: `/pipeline/${id}`,
    method: 'GET'
  })
  const { data } = res as { code: number; msg: string; data: Pipeline }
  return data
}

export const apiCreatePipeline = async (
  pipeline: CreatePipelineRequest
): Promise<Pipeline> => {
  const res = await request({
    url: '/pipeline',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: pipeline
  })
  const { data } = res as { code: number; msg: string; data: Pipeline }
  return data
}

export const apiUpdatePipeline = async (
  id: number,
  pipeline: UpdatePipelineRequest
): Promise<void> => {
  await request({
    url: `/pipeline/${id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    data: pipeline
  })
}

export const apiDeletePipeline = async (id: number): Promise<void> => {
  await request({
    url: `/pipeline/${id}`,
    method: 'DELETE'
  })
}

export const apiTriggerPipeline = async (
  id: number,
  payload?: { branch?: string; commit_msg?: string }
): Promise<PipelineExecution> => {
  const res = await request({
    url: `/pipeline/${id}/trigger`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload || {}
  })
  const { data } = res as { code: number; msg: string; data: PipelineExecution }
  return data
}

export const apiGetPipelineExecutions = async (
  pipelineId: number,
  limit = 20,
  offset = 0
): Promise<PipelineExecution[]> => {
  const res = await request({
    url: `/pipeline/${pipelineId}/executions?limit=${limit}&offset=${offset}`,
    method: 'GET'
  })
  const { data } = res as {
    code: number
    msg: string
    data: PipelineExecution[]
  }
  return data
}

export const apiGetPipelineExecution = async (
  id: number
): Promise<PipelineExecution> => {
  const res = await request({
    url: `/pipeline-execution/${id}`,
    method: 'GET'
  })
  const { data } = res as { code: number; msg: string; data: PipelineExecution }
  return data
}

export const apiGenerateWebhookSecret = async (): Promise<{
  secret: string
}> => {
  const res = await request({
    url: '/pipeline/generate-secret',
    method: 'POST'
  })
  const { data } = res as {
    code: number
    msg: string
    data: { secret: string }
  }
  return data
}

export const apiTestWebhook = async (): Promise<unknown> => {
  const res = await request({
    url: '/pipeline/webhook/test',
    method: 'GET'
  })
  return res
}
