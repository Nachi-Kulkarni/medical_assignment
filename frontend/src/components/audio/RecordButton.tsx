import { Mic, Square } from 'lucide-react'

interface RecordButtonProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export function RecordButton({ isRecording, onStart, onStop, disabled = false }: RecordButtonProps) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      className={`
        w-14 h-14 rounded-full flex items-center justify-center transition-all
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-nao-green hover:opacity-80'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <Square className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-nao-navy" />
      )}
    </button>
  )
}
