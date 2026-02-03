import { useEffect, useRef, useCallback, useState } from 'react'
import { createWebSocketClient, WebSocketClient } from '../services/websocket'
import type { WSMessage, Message } from '../types'

export function useWebSocket(conversationId: string) {
  const clientRef = useRef<WebSocketClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState<{ role: 'doctor' | 'patient' } | null>(null)

  useEffect(() => {
    if (!conversationId) return

    // Clear messages when conversation changes
    setMessages([])

    const client = createWebSocketClient(conversationId)

    // Set up message handler
    const unsubscribe = client.onMessage((wsMessage: WSMessage) => {
      switch (wsMessage.type) {
        case 'new_message':
          if (wsMessage.data) {
            setMessages((prev) => [...prev, wsMessage.data as Message])
          }
          break
        case 'typing':
          if (wsMessage.data) {
            // Only show typing indicator if is_typing is true
            setIsTyping(wsMessage.data.is_typing ? wsMessage.data : null)
          }
          break
        case 'joined':
        case 'error':
          console.log('WebSocket:', wsMessage.type, wsMessage.data)
          break
      }
    })

    // Connect
    client.connect()
    clientRef.current = client

    // Update connection status
    setIsConnected(true)

    return () => {
      unsubscribe()
      client.disconnect()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [conversationId])

  const joinConversation = useCallback((role: 'doctor' | 'patient') => {
    clientRef.current?.joinConversation(role)
  }, [])

  const sendMessage = useCallback((text: string, role: 'doctor' | 'patient', audioUrl?: string) => {
    clientRef.current?.sendMessage(text, role, audioUrl)
  }, [])

  const sendTyping = useCallback((role: 'doctor' | 'patient', isTyping: boolean) => {
    clientRef.current?.sendTyping(role, isTyping)
  }, [])

  return {
    isConnected,
    messages,
    isTyping,
    joinConversation,
    sendMessage,
    sendTyping,
  }
}
