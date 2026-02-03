import { useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi } from '../services/api'
import type { Message } from '../types'

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.list(conversationId),
    enabled: !!conversationId,
  })

  const addMessage = (message: Message) => {
    queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
      ...old,
      message,
    ])
  }

  return { messages, isLoading, addMessage }
}
