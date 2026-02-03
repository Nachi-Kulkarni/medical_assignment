import { useMutation } from '@tanstack/react-query'
import { translationApi } from '../services/api'
import type { TranslateRequest } from '../types'

export function useTranslate() {
  const mutation = useMutation({
    mutationFn: (request: TranslateRequest) => translationApi.translate(request),
  })

  return {
    translate: mutation.mutateAsync,
    isTranslating: mutation.isPending,
    error: mutation.error,
  }
}
