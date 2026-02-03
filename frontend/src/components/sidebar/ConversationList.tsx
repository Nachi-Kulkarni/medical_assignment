import { Conversation } from '../../types'
import { MessageSquare, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ConversationListProps {
  conversations: Conversation[]
  activeId?: string
  loading?: boolean
}

export function ConversationList({ conversations, activeId, loading = false }: ConversationListProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    return isToday
      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="overflow-y-auto flex-1">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => navigate(`/chat/${conv.id}`)}
          className={`
            w-full p-4 text-left hover:bg-gray-50 transition-colors border-b
            ${conv.id === activeId ? 'bg-nao-light border-l-4 border-l-nao-green' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 text-sm font-medium text-nao-navy">
              <MessageSquare className="w-4 h-4" />
              <span>
                {conv.doctor_language.toUpperCase()} → {conv.patient_language.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(conv.created_at)}
            </span>
          </div>

          <div className="text-xs text-gray-500">
            {conv.status === 'active' ? (
              <span className="text-nao-green">Active</span>
            ) : conv.status === 'completed' ? (
              <span className="text-blue-500">Completed</span>
            ) : (
              <span className="text-gray-400">Archived</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
