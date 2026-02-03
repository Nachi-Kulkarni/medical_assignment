import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChatLayout } from '../components/chat/ChatLayout'
import { ChatPageContent } from '../components/chat/ChatPageContent'
import { ConversationList } from '../components/sidebar/ConversationList'
import { SearchBar } from '../components/sidebar/SearchBar'
import { SearchResults } from '../components/sidebar/SearchResults'
import { useConversations } from '../hooks/useConversation'
import { useChatContext } from '../context/ChatContext'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { conversations, isLoading } = useConversations()
  const { setConversation } = useChatContext()
  const [searchQuery, setSearchQuery] = useState('')

  // Set current conversation in context
  useEffect(() => {
    const conv = conversations.find((c) => c.id === conversationId)
    setConversation(conv || null)
  }, [conversationId, conversations, setConversation])

  const sidebar = (
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-nao-navy">Conversations</h2>
      </div>
      <SearchBar onSearch={setSearchQuery} placeholder="Search messages..." />
      {searchQuery ? (
        <SearchResults query={searchQuery} />
      ) : (
        <ConversationList conversations={conversations} activeId={conversationId} loading={isLoading} />
      )}
    </>
  )

  return (
    <ChatLayout sidebar={sidebar}>
      {conversationId ? <ChatPageContent conversationId={conversationId} /> : null}
    </ChatLayout>
  )
}

