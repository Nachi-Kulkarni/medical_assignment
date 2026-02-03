import { Mic, MicOff, X } from 'lucide-react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

interface SpeechInputProps {
  language?: string
  onTranscript: (text: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SpeechInput({
  language = 'en-US',
  onTranscript,
  placeholder = 'Click mic to speak...',
  disabled = false,
  className = '',
}: SpeechInputProps) {
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition(language)

  const displayText = transcript || interimTranscript || ''

  // Call onTranscript when final transcript changes
  if (transcript && !isListening) {
    onTranscript(transcript)
  }

  if (!isSupported) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg text-gray-600 text-sm ${className}`}>
        Speech recognition is not supported in this browser. Please use Chrome or Edge.
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-colors
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-nao-green hover:opacity-80 text-nao-navy'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-h-[24px]">
          {displayText ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-800">{displayText}</span>
              {transcript && (
                <button
                  onClick={() => {
                    resetTranscript()
                    onTranscript('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Clear transcript"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        {isListening && interimTranscript && (
          <span className="text-xs text-gray-500 animate-pulse">Listening...</span>
        )}
      </div>
    </div>
  )
}
