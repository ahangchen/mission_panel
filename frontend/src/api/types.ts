// API Type definitions

export interface Task {
  id: number
  job_id: string
  task_name: string | null
  status: 'ok' | 'error' | 'running' | 'pending'
  start_time: string | null
  end_time: string | null
  duration_ms: number | null
  model: string | null
  summary: string | null
}

export interface TaskDetail extends Task {
  session_id: string | null
  error_message: string | null
  provider: string | null
  input_tokens: number | null
  output_tokens: number | null
}

export interface TaskStats {
  total: number
  completed: number
  failed: number
  running: number
  pending: number
}

export interface TaskListResponse {
  total: number
  page: number
  page_size: number
  tasks: Task[]
}

export interface FileItem {
  name: string
  path: string
  is_directory: boolean
  size: number
  modified_time: number
}

export interface FileListResponse {
  path: string
  items: FileItem[]
}

export interface FileContentResponse {
  path: string
  content: string
  file_type: string
  size: number
}

export interface SkillRanking {
  rank: number
  skill_name: string
  count: number
  avg_duration_ms: number
}

export interface SkillStatsResponse {
  period_days: number
  ranking: SkillRanking[]
}

export interface ModelStats {
  model: string
  count: number
  percentage: number
  total_input_tokens: number
  total_output_tokens: number
}

export interface ModelStatsResponse {
  period_days: number
  total_tasks: number
  models: ModelStats[]
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

export interface SearchResult {
  name: string
  path: string
  is_directory: boolean
  size: number
}

export interface SearchResponse {
  query: string
  count: number
  results: SearchResult[]
}
