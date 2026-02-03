import axios from 'axios'
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  CreateMessageRequest,
  TranslateRequest,
  TranslateResponse,
  MedicalSummary,
  SearchResult,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Conversations
export const conversationsApi = {
  list: async () => {
    const { data } = await api.get<Conversation[]>('/api/conversations')
    return data
  },

  create: async (request: CreateConversationRequest) => {
    const { data } = await api.post<Conversation>('/api/conversations', request)
    return data
  },

  get: async (id: string) => {
    const { data } = await api.get<Conversation>(`/api/conversations/${id}`)
    return data
  },

  update: async (id: string, updates: Partial<Conversation>) => {
    const { data } = await api.patch<Conversation>(`/api/conversations/${id}`, updates)
    return data
  },

  delete: async (id: string) => {
    await api.delete(`/api/conversations/${id}`)
  },
}

// Messages
export const messagesApi = {
  create: async (request: CreateMessageRequest) => {
    const { data } = await api.post<Message>('/api/messages', request)
    return data
  },

  list: async (conversationId: string) => {
    const { data } = await api.get<Message[]>(`/api/messages/${conversationId}`)
    return data
  },
}

// Translation
export const translationApi = {
  translate: async (request: TranslateRequest) => {
    const { data } = await api.post<TranslateResponse>('/api/translate', request)
    return data
  },
}

// Summary
export const summaryApi = {
  generate: async (conversationId: string) => {
    const { data } = await api.post<MedicalSummary>(`/api/conversations/${conversationId}/summarize`)
    return data
  },
}

// Search
export const searchApi = {
  search: async (query: string) => {
    const { data } = await api.get<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`)
    return data
  },
}

// Audio
export const audioApi = {
  upload: async (blob: Blob) => {
    const formData = new FormData()
    formData.append('file', blob, 'recording.webm')
    const { data } = await api.post<{ id: string; filename: string; url: string }>('/api/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

// Health check
export const healthApi = {
  check: async () => {
    const { data } = await api.get<{ status: string; version: string }>('/health')
    return data
  },
}

export default api
