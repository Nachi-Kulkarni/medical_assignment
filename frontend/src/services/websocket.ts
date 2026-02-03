import type { WSMessage, WSClientMessage } from '../types'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export type WebSocketEventHandler = (message: WSMessage) => void

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private handlers: Set<WebSocketEventHandler> = new Set()

  constructor(conversationId: string) {
    this.url = `${WS_URL}/ws/${conversationId}`
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.handlers.forEach((handler) => handler(message))
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts
      console.log(`Reconnecting in ${delay}ms...`)
      setTimeout(() => this.connect(), delay)
    }
  }

  send(message: WSClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  joinConversation(role: 'doctor' | 'patient'): void {
    this.send({ type: 'join_conversation', conversation_id: this.getConversationId(), role })
  }

  sendMessage(text: string, role: 'doctor' | 'patient', audioUrl?: string): void {
    this.send({ type: 'send_message', text, role, audio_url: audioUrl })
  }

  sendTyping(role: 'doctor' | 'patient', isTyping: boolean): void {
    this.send({ type: 'typing', role, is_typing: isTyping })
  }

  onMessage(handler: WebSocketEventHandler): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
  }

  private getConversationId(): string {
    return this.url.split('/').pop() || ''
  }
}

export function createWebSocketClient(conversationId: string): WebSocketClient {
  return new WebSocketClient(conversationId)
}
