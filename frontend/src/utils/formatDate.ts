// Utility functions

/**
 * Format date to human-readable string
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number | undefined): string {
  if (!ms) return 'N/A'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatSize(bytes: number | undefined): string {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number | undefined): string {
  if (!num) return '0'
  return num.toLocaleString()
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ok':
      return 'text-green-500 bg-green-50'
    case 'error':
      return 'text-red-500 bg-red-50'
    case 'running':
      return 'text-blue-500 bg-blue-50'
    case 'pending':
      return 'text-gray-500 bg-gray-50'
    default:
      return 'text-gray-500 bg-gray-50'
  }
}

/**
 * Get status icon name
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'ok':
      return '✅'
    case 'error':
      return '❌'
    case 'running':
      return '⏳'
    case 'pending':
      return '⏸️'
    default:
      return '❓'
  }
}

/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Get language from file extension
 */
export function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sh: 'bash',
    bash: 'bash',
    sql: 'sql',
  }
  return languageMap[ext] || 'text'
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}
