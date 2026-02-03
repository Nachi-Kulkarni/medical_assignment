import { Message, Role } from '../../types'
import { AudioPlayer } from '../audio/AudioPlayer'

interface MessageBubbleProps {
  message: Message
  currentRole: Role
}

export function MessageBubble({ message, currentRole }: MessageBubbleProps) {
  // My messages are on the right, other person's on the left
  const isMyMessage = message.role === currentRole
  const createdAt = new Date(message.created_at)
  const formattedTime = createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-4 ${
        isMyMessage ? 'bg-nao-navy text-white' : 'bg-nao-green text-nao-navy'
      }`}>
        {/* Role label */}
        <div className="text-xs font-medium opacity-70 mb-1">
          {message.role === 'doctor' ? 'Doctor' : 'Patient'}
        </div>

        {/* Original text */}
        <p className="text-sm opacity-80">{message.original_text}</p>

        {/* Divider */}
        <hr className={`my-2 opacity-30 ${
          isMyMessage ? 'border-white' : 'border-nao-navy'
        }`} />

        {/* Translated text */}
        <p className="font-medium">{message.translated_text}</p>

        {/* Audio player if present */}
        {message.audio_url && (
          <div className="mt-3">
            <AudioPlayer src={message.audio_url} />
          </div>
        )}

        {/* Timestamp */}
        <time className="text-xs opacity-60 mt-2 block">
          {formattedTime}
        </time>
      </div>
    </div>
  )
}
