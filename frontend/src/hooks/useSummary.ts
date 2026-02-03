import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { summaryApi } from '../services/api'

export function useSummary(conversationId: string) {
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => summaryApi.generate(conversationId),
    onSuccess: () => {
      // Invalidate conversation query to refetch with new summary
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
  })

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      const summary = await mutation.mutateAsync()
      return summary
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateSummary,
    isGenerating: isGenerating || mutation.isPending,
    error: mutation.error,
  }
}
