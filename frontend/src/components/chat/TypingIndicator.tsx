interface TypingIndicatorProps {
  role: 'doctor' | 'patient'
}

export function TypingIndicator({ role }: TypingIndicatorProps) {
  const isDoctor = role === 'doctor'

  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`px-4 py-3 rounded-lg ${
        isDoctor ? 'bg-nao-navy' : 'bg-nao-green'
      }`}>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            isDoctor ? 'bg-white' : 'bg-nao-navy'
          }`} style={{ animationDelay: '0ms' }} />
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            isDoctor ? 'bg-white' : 'bg-nao-navy'
          }`} style={{ animationDelay: '150ms' }} />
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            isDoctor ? 'bg-white' : 'bg-nao-navy'
          }`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
