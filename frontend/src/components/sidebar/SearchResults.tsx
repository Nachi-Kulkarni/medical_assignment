import { useEffect, useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { searchApi } from '../../services/api'
import type { SearchResult } from '../../types'

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const navigate = useNavigate()
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchMessages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await searchApi.search(query)
        setResults(data)
      } catch (err) {
        setError('Failed to search messages')
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    searchMessages()
  }, [query])

  if (!query.trim()) return null

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-nao-green" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        {error}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        No messages found for "{query}"
      </div>
    )
  }

  const handleResultClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`)
  }

  return (
    <div className="border-t">
      <div className="p-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
        Search Results
      </div>
      <div className="max-h-64 overflow-y-auto">
        {results.map((result) => (
          <button
            key={`${result.conversation_id}-${result.message_id}`}
            onClick={() => handleResultClick(result.conversation_id)}
            className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-nao-green mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm text-gray-800 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.highlighted_text }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {result.role === 'doctor' ? 'Doctor' : 'Patient'} • {new Date(result.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
