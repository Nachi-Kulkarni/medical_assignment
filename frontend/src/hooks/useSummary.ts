import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { summaryApi } from '../services/api'
import type { MedicalSummary } from '../types'

export function useSummary(conversationId: string) {
  const [isGenerating, setIsGenerating] = useState(false)

  const mutation = useMutation({
    mutationFn: () => summaryApi.generate(conversationId),
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
