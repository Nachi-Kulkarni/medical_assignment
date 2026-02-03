import { useState, useEffect } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { Header } from '../controls/Header'
import { RoleSelector } from '../controls/RoleSelector'
import { LanguageSelector } from '../controls/LanguageSelector'
import { SummaryPanel } from '../summary/SummaryPanel'
import { useChatContext } from '../../context/ChatContext'
import { useConversation } from '../../hooks/useConversation'
import { useMessages } from '../../hooks/useMessages'
import { useTranslate } from '../../hooks/useTranslate'
import { useSummary } from '../../hooks/useSummary'
import { useWebSocket } from '../../hooks/useWebSocket'
import { audioApi } from '../../services/api'
import type { Role, MedicalSummary } from '../../types'

interface ChatPageContentProps {
  conversationId: string
}

export function ChatPageContent({ conversationId }: ChatPageContentProps) {
  const { conversation } = useConversation(conversationId)
  const { messages, isLoading: msgLoading } = useMessages(conversationId)
  const { isTranslating } = useTranslate()
  const { generateSummary, isGenerating } = useSummary(conversationId)
  const { doctorLanguage, patientLanguage } = useChatContext()

  // WebSocket connection
  const { isConnected, messages: wsMessages, sendMessage, sendTyping, isTyping } = useWebSocket(conversationId)

  // Summary panel state
  const [showSummary, setShowSummary] = useState(false)

  // Combine REST messages with WebSocket messages
  const allMessages = [...messages, ...wsMessages]

  // Join conversation when connected
  useEffect(() => {
    if (isConnected && conversationId) {
      // Join will be handled by the role selector
    }
  }, [isConnected, conversationId])

  // Use conversation's languages if available, otherwise use defaults
  const doctorLang = conversation?.doctor_language || doctorLanguage
  const patientLang = conversation?.patient_language || patientLanguage

  // State for role selector
  const [selectedRole, setSelectedRole] = useState<Role>('doctor')

  const handleSendMessage = async (text: string, audioBlob?: { blob: Blob; url: string }) => {
    // Upload audio if present
    let audioUrl: string | undefined
    if (audioBlob?.blob) {
      try {
        const upload = await audioApi.upload(audioBlob.blob)
        audioUrl = upload.url
      } catch (error) {
        console.error('Failed to upload audio:', error)
      }
    }

    // Send via WebSocket - backend will handle translation and transcription
    sendMessage(text, selectedRole, audioUrl)
  }

  const handleShowSummary = () => {
    setShowSummary(true)
  }

  const handleRegenerateSummary = async () => {
    await generateSummary()
  }

  const handleTyping = (isCurrentlyTyping: boolean) => {
    sendTyping(selectedRole, isCurrentlyTyping)
  }

  const header = (
    <Header
      title="MedTranslate Chat"
      onShowSummary={handleShowSummary}
      conversationId={conversationId}
    />
  )

  return (
    <>
      <div className="flex flex-col h-full">
        {header}

        {/* Role and language selectors */}
        <div className="bg-white border-b p-3 flex flex-wrap items-center gap-4">
          <RoleSelector value={selectedRole} onChange={setSelectedRole} />
          <LanguageSelector
            value={doctorLang}
            onChange={() => {}}
            label={`Doctor: ${doctorLang.toUpperCase()}`}
            disabled
          />
          <LanguageSelector
            value={patientLang}
            onChange={() => {}}
            label={`Patient: ${patientLang.toUpperCase()}`}
            disabled
          />
        </div>

        {/* Messages */}
        {msgLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <MessageList messages={allMessages} currentRole={selectedRole} isTyping={isTyping} />
        )}

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={isTranslating}
          placeholder={isTranslating ? 'Translating...' : `Type a message as ${selectedRole}...`}
          language={selectedRole === 'doctor' ? 'en-US' : 'es-ES'}
        />
      </div>

      {/* Summary Panel */}
      {showSummary && (
        <SummaryPanel
          summary={conversation?.summary as MedicalSummary | null}
          isLoading={isGenerating}
          onRegenerate={handleRegenerateSummary}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  )
}

