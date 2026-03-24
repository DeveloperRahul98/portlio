'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ProjectStatus, STATUS_CONFIG } from '@/lib/types'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StatusTrackerProps {
  projectId: string
  currentStatus: ProjectStatus
  accentColor: string
  readonly?: boolean
  onStatusChange?: (status: ProjectStatus) => void
}

const STATUS_ORDER: ProjectStatus[] = ['kickoff', 'in_progress', 'review', 'complete']

export function StatusTracker({ projectId, currentStatus, accentColor, readonly, onStatusChange }: StatusTrackerProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus)
  const [updating, setUpdating] = useState<string | null>(null)
  const [historyCounts, setHistoryCounts] = useState<Record<string, number>>({})

  const currentStep = STATUS_CONFIG[status].step

  // Fetch status change counts (only in freelancer view)
  useEffect(() => {
    if (readonly) return
    const supabase = createClient()
    supabase
      .from('status_history')
      .select('to_status')
      .eq('project_id', projectId)
      .then(({ data }) => {
        if (data) {
          const counts: Record<string, number> = {}
          for (const row of data) {
            counts[row.to_status] = (counts[row.to_status] ?? 0) + 1
          }
          setHistoryCounts(counts)
        }
      })
  }, [projectId, readonly])

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (readonly || newStatus === status) return
    setUpdating(newStatus)

    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    if (!error) {
      // Log status change history
      await supabase.from('status_history').insert({
        project_id: projectId,
        from_status: status,
        to_status: newStatus,
      })
      setHistoryCounts(prev => ({
        ...prev,
        [newStatus]: (prev[newStatus] ?? 0) + 1,
      }))
      setStatus(newStatus)
      onStatusChange?.(newStatus)
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
    } else {
      toast.error('Failed to update status')
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 relative">
        {/* Track */}
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border/60 z-0 rounded-full" />
        <motion.div
          className="absolute left-4 top-4 h-0.5 z-0 rounded-full"
          style={{ background: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (STATUS_ORDER.length - 1)) * calc100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {STATUS_ORDER.map((s, i) => {
          const config = STATUS_CONFIG[s]
          const isActive = config.step === currentStep
          const isDone = config.step < currentStep
          const isClickable = !readonly && config.step <= currentStep + 1
          const count = historyCounts[s]

          return (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5 z-10">
              <button
                onClick={() => handleStatusChange(s)}
                disabled={!isClickable || updating !== null}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isClickable && !readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  background: isDone || isActive ? accentColor : 'var(--muted)',
                  border: `2px solid ${isDone || isActive ? accentColor : 'var(--border)'}`,
                  boxShadow: isActive ? `0 0 14px ${accentColor}55` : 'none',
                }}
              >
                {updating === s ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground/50" />
                )}
              </button>

              <span
                className={`text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : isDone
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {config.label}
                {!readonly && count !== undefined && count > 0 && (s === 'in_progress' || s === 'review') && (
                  <span
                    className="text-xs font-semibold leading-none"
                    style={{ color: accentColor, opacity: 0.8 }}
                  >
                    {count}×
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const calc100 = 100
