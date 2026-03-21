// API Client

const API_BASE = '/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Tasks API
export const tasksAPI = {
  getWeekTasks: (status?: string, page = 1, pageSize = 50) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (status) params.append('status', status)
    return fetchAPI(`/tasks/week?${params}`)
  },

  getTaskStats: () => fetchAPI('/tasks/stats'),

  getTaskDetail: (taskId: number) => fetchAPI(`/tasks/${taskId}`),

  searchTasks: (query: string, status?: string) => {
    const params = new URLSearchParams({ q: query })
    if (status) params.append('status', status)
    return fetchAPI(`/tasks/search?${params}`)
  },
}

// Files API
export const filesAPI = {
  listDirectory: (path = '') => {
    const params = path ? `?path=${encodeURIComponent(path)}` : ''
    return fetchAPI(`/files/list${params}`)
  },

  readFile: (path: string) => fetchAPI(`/files/read?path=${encodeURIComponent(path)}`),

  searchFiles: (query: string, limit = 50) => {
    return fetchAPI(`/files/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  },
}

// Stats API
export const statsAPI = {
  getSkillStats: (days = 7, limit = 20) => {
    return fetchAPI(`/stats/skills?days=${days}&limit=${limit}`)
  },

  getModelStats: (days = 7) => {
    return fetchAPI(`/stats/models?days=${days}`)
  },

  getOverview: () => fetchAPI('/stats/overview'),
}
