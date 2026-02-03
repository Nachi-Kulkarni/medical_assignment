import { useState, FormEvent } from 'react'
import { Send, Keyboard } from 'lucide-react'
import { RecordButton } from '../audio/RecordButton'
import { SpeechInput } from '../audio/SpeechInput'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'

interface MessageInputProps {
  onSendMessage: (text: string, audioBlob?: { blob: Blob; url: string; duration: number }) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
  language?: string
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  language = 'en-US',
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [showSpeechInput, setShowSpeechInput] = useState(false)
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    // Trigger typing indicator
    if (onTyping) {
      onTyping(newText.length > 0)
    }
  }

  const handleSpeechTranscript = (transcript: string) => {
    if (transcript) {
      setText(transcript)
      setShowSpeechInput(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !audioBlob) return

    onSendMessage(text, audioBlob || undefined)
    setText('')
    resetRecording()
    // Stop typing indicator
    if (onTyping) {
      onTyping(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      {/* Speech Input */}
      {showSpeechInput && (
        <div className="mb-3">
          <SpeechInput
            language={language}
            onTranscript={handleSpeechTranscript}
            placeholder="Click the mic and speak..."
            disabled={disabled}
          />
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Audio recording button */}
        <RecordButton
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
          disabled={disabled}
        />

        {/* Speech-to-text toggle button */}
        <button
          type="button"
          onClick={() => setShowSpeechInput(!showSpeechInput)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            showSpeechInput
              ? 'bg-nao-navy text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title="Speech to text"
        >
          <Keyboard className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-nao-green disabled:opacity-50"
          />
          {audioBlob && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Audio recorded ({Math.round(audioBlob.duration / 1000)}s)
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || isRecording || (!text.trim() && !audioBlob)}
          className="px-4 py-2 bg-nao-navy text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </form>
  )
}
