import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus } from 'lucide-react'
import { ChatLayout } from '../components/chat/ChatLayout'
import { Header } from '../components/controls/Header'
import { ConversationList } from '../components/sidebar/ConversationList'
import { SearchBar } from '../components/sidebar/SearchBar'
import { SearchResults } from '../components/sidebar/SearchResults'
import { useConversations } from '../hooks/useConversation'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { conversations, isLoading, createConversation, isCreating } = useConversations()

  const handleCreateConversation = async () => {
    const conv = await createConversation({
      doctor_language: 'en',
      patient_language: 'es',
    })
    navigate(`/chat/${conv.id}`)
  }

  const sidebar = (
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-nao-navy">Conversations</h2>
      </div>
      <SearchBar onSearch={setSearchQuery} placeholder="Search messages..." />
      {searchQuery ? (
        <SearchResults query={searchQuery} />
      ) : (
        <ConversationList conversations={conversations} loading={isLoading} />
      )}
    </>
  )

  const header = (
    <Header title="MedTranslate" onShowSummary={undefined} conversationId={undefined} />
  )

  return (
    <ChatLayout header={header} sidebar={sidebar}>
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-nao-green rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-nao-navy" />
        </div>

        <h1 className="text-3xl font-bold text-nao-navy mb-3 text-center">
          MedTranslate
        </h1>
        <p className="text-nao-gray text-center mb-6 max-w-md">
          AI-powered real-time translation for healthcare conversations.
        </p>

        <button
          onClick={handleCreateConversation}
          disabled={isCreating}
          className="flex items-center gap-2 px-6 py-3 bg-nao-navy text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          {isCreating ? 'Creating...' : 'Start New Conversation'}
        </button>
      </div>
    </ChatLayout>
  )
}

