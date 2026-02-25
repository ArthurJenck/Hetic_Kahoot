// ============================================================
// Hook useWebSocket - Ce fichier est COMPLET
// Auto-reconnexion avec backoff exponentiel
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ClientMessage, ServerMessage } from '@shared/index'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface UseWebSocketReturn {
  /** Etat actuel de la connexion */
  status: ConnectionStatus
  /** Envoie un message au serveur */
  sendMessage: (message: ClientMessage) => void
  /** Dernier message recu du serveur */
  lastMessage: ServerMessage | null
}

/**
 * Hook React pour gerer une connexion WebSocket avec auto-reconnexion.
 *
 * @param url - URL du serveur WebSocket (ex: "ws://localhost:3001")
 * @returns Objet avec status, sendMessage et lastMessage
 *
 * @example
 * ```tsx
 * const { status, sendMessage, lastMessage } = useWebSocket('ws://localhost:3001')
 *
 * useEffect(() => {
 *   if (lastMessage?.type === 'joined') {
 *     setPlayers(lastMessage.players)
 *   }
 * }, [lastMessage])
 *
 * const handleJoin = () => {
 *   sendMessage({ type: 'join', quizCode: 'ABC123', name: 'Alice' })
 * }
 * ```
 */
export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const unmountedRef = useRef(false)

  const MAX_RECONNECT_DELAY = 30000 // 30 secondes max

  const connect = useCallback(() => {
    if (unmountedRef.current) return

    // Nettoyer la connexion precedente
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (unmountedRef.current) {
        ws.close()
        return
      }
      console.log('[useWebSocket] Connecte')
      setStatus('connected')
      reconnectAttemptRef.current = 0
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as ServerMessage
        setLastMessage(message)
      } catch (err) {
        console.error('[useWebSocket] Erreur de parsing:', err)
      }
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      console.log('[useWebSocket] Deconnecte')
      setStatus('disconnected')
      wsRef.current = null

      // Reconnexion avec backoff exponentiel : 1s, 2s, 4s, 8s... max 30s
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttemptRef.current),
        MAX_RECONNECT_DELAY
      )
      console.log(`[useWebSocket] Reconnexion dans ${delay}ms...`)
      reconnectAttemptRef.current += 1

      reconnectTimeoutRef.current = setTimeout(() => {
        if (!unmountedRef.current) {
          connect()
        }
      }, delay)
    }

    ws.onerror = (event: Event) => {
      console.error('[useWebSocket] Erreur:', event)
      // onclose sera appele automatiquement apres onerror
    }
  }, [url])

  // Connexion initiale et cleanup
  useEffect(() => {
    unmountedRef.current = false
    connect()

    return () => {
      unmountedRef.current = true

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('[useWebSocket] Impossible d\'envoyer, WebSocket non connecte')
    }
  }, [])

  return { status, sendMessage, lastMessage }
}
