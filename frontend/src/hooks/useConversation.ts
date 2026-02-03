import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { conversationsApi } from '../services/api'
import type { CreateConversationRequest } from '../types'

export function useConversations() {
  const queryClient = useQueryClient()

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (request: CreateConversationRequest) => conversationsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  return {
    conversations,
    isLoading,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export function useConversation(conversationId: string) {
  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationsApi.get(conversationId),
    enabled: !!conversationId,
  })

  return { conversation, isLoading }
}
