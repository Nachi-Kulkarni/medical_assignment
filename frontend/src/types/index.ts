// Core types for MedTranslate application

export type Role = 'doctor' | 'patient'

export type Language = 'en' | 'es' | 'zh' | 'vi' | 'ko' | 'ar' | 'fr'

export type ConversationStatus = 'active' | 'completed' | 'archived'

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  doctor_language: Language
  patient_language: Language
  status: ConversationStatus
  summary?: MedicalSummary
}

export interface Message {
  id: string
  conversation_id: string
  role: Role
  original_text: string
  translated_text: string
  audio_url?: string
  created_at: string
}

export interface MedicalSummary {
  chief_complaint: string
  symptoms: string[]
  duration: string
  medications: string[]
  allergies: string[]
  follow_up: string
}

export interface TranslateRequest {
  text: string
  source_language: Language
  target_language: Language
}

export interface TranslateResponse {
  original_text: string
  translated_text: string
  source_language: Language
  target_language: Language
}

export interface CreateConversationRequest {
  doctor_language?: Language
  patient_language?: Language
}

export interface CreateMessageRequest {
  conversation_id: string
  role: Role
  original_text: string
  translated_text: string
  audio_url?: string
}

export interface SearchResult {
  message_id: string
  conversation_id: string
  snippet: string
  highlighted_text: string
  role: Role
  created_at: string
}

// WebSocket message types
export interface WSMessage {
  type: 'new_message' | 'typing' | 'error' | 'joined'
  data?: any
}

export interface WSSendMessage {
  type: 'send_message'
  text: string
  role: Role
  audio_url?: string
}

export interface WSTypingMessage {
  type: 'typing'
  role: Role
  is_typing: boolean
}

export interface WSJoinMessage {
  type: 'join_conversation'
  conversation_id: string
  role: Role
}

export type WSClientMessage = WSSendMessage | WSTypingMessage | WSJoinMessage

