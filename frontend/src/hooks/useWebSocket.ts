import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSocketOptions {
  url: string
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (err) {
          // Handle plain text messages
          onMessage?.(event.data)
        }
      }

      ws.onerror = (event) => {
        setError('WebSocket error')
        onError?.(event)
      }

      ws.onclose = () => {
        setIsConnected(false)
        onClose?.()

        // Attempt to reconnect
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current = ws
    } catch (err) {
      setError('Failed to connect to WebSocket')
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    wsRef.current?.close()
  }, [])

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      wsRef.current.send(message)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    error,
    send,
    disconnect,
    reconnect: connect,
  }
}

// Task updates WebSocket hook
export function useTaskUpdates(onTaskUpdate?: (task: any) => void) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { isConnected, error, send } = useWebSocket({
    url: `ws://${window.location.hostname}:8000/ws/tasks`,
    onMessage: (data) => {
      if (data.type === 'task_update') {
        setLastUpdate(new Date())
        onTaskUpdate?.(data.data)
      }
    },
    onOpen: () => {
      console.log('WebSocket connected to task updates')
    },
    onClose: () => {
      console.log('WebSocket disconnected from task updates')
    },
  })

  const ping = useCallback(() => {
    send('ping')
  }, [send])

  return {
    isConnected,
    error,
    lastUpdate,
    ping,
  }
}
