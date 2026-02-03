import { createContext, useContext, useState, ReactNode } from 'react'
import type { Role, Language, Message, Conversation } from '../types'

interface ChatContextType {
  // Role and language settings
  role: Role
  setRole: (role: Role) => void
  doctorLanguage: Language
  setDoctorLanguage: (language: Language) => void
  patientLanguage: Language
  setPatientLanguage: (language: Language) => void

  // Current conversation
  conversation: Conversation | null
  setConversation: (conversation: Conversation | null) => void

  // Messages
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('doctor')
  const [doctorLanguage, setDoctorLanguage] = useState<Language>('en')
  const [patientLanguage, setPatientLanguage] = useState<Language>('es')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  return (
    <ChatContext.Provider
      value={{
        role,
        setRole,
        doctorLanguage,
        setDoctorLanguage,
        patientLanguage,
        setPatientLanguage,
        conversation,
        setConversation,
        messages,
        setMessages,
        addMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}
