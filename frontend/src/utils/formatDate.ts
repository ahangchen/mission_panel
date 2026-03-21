import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = parseISO(dateString)
    return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN })
  } catch {
    return dateString
  }
}

export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = parseISO(dateString)
    return format(date, 'MM-dd HH:mm', { locale: zhCN })
  } catch {
    return dateString
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = parseISO(dateString)
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  } catch {
    return dateString
  }
}

export function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}
