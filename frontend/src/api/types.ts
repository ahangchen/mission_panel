// Type definitions for Mission Panel API

export interface Task {
  id: number
  job_id: string
  session_id?: string
  task_name?: string
  status: 'ok' | 'error' | 'running' | 'pending'
  start_time: string
  end_time?: string
  duration_ms?: number
  error_message?: string
  summary?: string
  model?: string
  provider?: string
  input_tokens?: number
  output_tokens?: number
}

export interface TaskListResponse {
  total: number
  page: number
  page_size: number
  tasks: Task[]
}

export interface TaskStats {
  total: number
  completed: number
  failed: number
  running: number
  pending: number
}

export interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified_time?: string
  extension?: string
}

export interface FileListResponse {
  path: string
  files: FileInfo[]
}

export interface FileContentResponse {
  path: string
  content: string
  language?: string
  size: number
}

export interface SkillUsage {
  skill_name: string
  count: number
  last_used: string
}

export interface ModelUsage {
  model: string
  provider: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  task_count: number
}

export interface OverviewStats {
  period: string
  tasks: {
    total: number
    completed: number
    success_rate: number
  }
  tokens: {
    input: number
    output: number
    total: number
  }
  skills: {
    unique_count: number
    total_calls: number
  }
}
