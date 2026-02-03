import { useState } from 'react'
import { X, RefreshCw, FileText } from 'lucide-react'
import type { MedicalSummary } from '../../types'

interface SummaryPanelProps {
  summary: MedicalSummary | null
  isLoading?: boolean
  onRegenerate: () => void
  onClose: () => void
}

export function SummaryPanel({ summary, isLoading, onRegenerate, onClose }: SummaryPanelProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-nao-navy text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Medical Summary</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || isLoading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Regenerate summary"
            >
              <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
          {isLoading || isRegenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-nao-green border-t-transparent rounded-full" />
              <span className="ml-3 text-gray-600">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <SummarySection
                title="Chief Complaint"
                content={summary.chief_complaint}
              />

              <SummarySection
                title="Symptoms"
                content={summary.symptoms.length > 0 ? summary.symptoms.join(', ') : 'Not discussed'}
              />

              <SummarySection
                title="Duration"
                content={summary.duration}
              />

              <SummarySection
                title="Medications"
                content={summary.medications.length > 0 ? summary.medications.join(', ') : 'Not discussed'}
              />

              <SummarySection
                title="Allergies"
                content={summary.allergies.length > 0 ? summary.allergies.join(', ') : 'Not discussed'}
              />

              <SummarySection
                title="Follow-up"
                content={summary.follow_up}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No summary available yet.</p>
              <p className="text-sm mt-1">Send some messages first, then generate a summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummarySection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-nao-navy uppercase tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-gray-700">{content || 'Not discussed'}</p>
    </div>
  )
}
