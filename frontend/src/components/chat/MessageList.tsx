import { useEffect, useRef } from 'react'
import { Message, Role } from '../../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessageListProps {
  messages: Message[]
  currentRole: Role
  isTyping?: { role: 'doctor' | 'patient' } | null
}

export function MessageList({ messages, currentRole, isTyping }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="max-w-md">
            <p className="text-nao-gray text-lg mb-2">
              No messages yet
            </p>
            <p className="text-gray-400 text-sm">
              Start a conversation by sending a message below.
            </p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} currentRole={currentRole} />
        ))
      )}

      {isTyping && <TypingIndicator role={isTyping.role} />}
    </div>
  )
}
