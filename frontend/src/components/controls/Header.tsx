import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  onShowSummary?: () => void
  conversationId?: string
}

export function Header({ title = 'MedTranslate', onShowSummary, conversationId }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        {conversationId && (
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-nao-navy" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-nao-navy">{title}</h1>
      </div>

      {onShowSummary && (
        <button
          onClick={onShowSummary}
          className="flex items-center gap-2 px-3 py-2 bg-nao-green text-nao-navy rounded-lg hover:opacity-80 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Summary</span>
        </button>
      )}
    </div>
  )
}
