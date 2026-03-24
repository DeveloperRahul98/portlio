'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Lock, Loader2, AlertTriangle, RotateCcw, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface ClosePortalButtonProps {
  clientId: string
  projectId: string
  projectStatus: string
}

interface HistorySummary {
  inProgressCount: number
  inReviewCount: number
  totalChanges: number
}

export function ClosePortalButton({ clientId, projectId, projectStatus }: ClosePortalButtonProps) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [history, setHistory] = useState<HistorySummary | null>(null)
  const router = useRouter()

  const isComplete = projectStatus === 'complete'

  const handleOpen = async () => {
    setLoadingHistory(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('status_history')
      .select('to_status')
      .eq('project_id', projectId)

    if (data) {
      setHistory({
        inProgressCount: data.filter(h => h.to_status === 'in_progress').length,
        inReviewCount: data.filter(h => h.to_status === 'review').length,
        totalChanges: data.length,
      })
    }
    setLoadingHistory(false)
    setOpen(true)
  }

  const handleClose = async () => {
    setClosing(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('clients')
      .update({ is_closed: true })
      .eq('id', clientId)

    if (!error) {
      toast.success('Portal closed — client can no longer interact')
      setOpen(false)
      router.refresh()
    } else {
      toast.error('Failed to close portal')
    }
    setClosing(false)
  }

  if (!isComplete) return null

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={loadingHistory}
        onClick={handleOpen}
        className="text-xs border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive/60 hover:bg-destructive/8 transition-all"
      >
        {loadingHistory
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <><Lock className="w-3.5 h-3.5 mr-1.5" />Close Portal</>
        }
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Close this portal?
            </DialogTitle>
            <DialogDescription>
              The client will no longer be able to reply or upload payment proof. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Project activity summary */}
          {history && (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Project activity
              </p>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Moved to <span className="font-semibold text-foreground">In Progress</span></span>
                <span className="ml-auto font-bold">{history.inProgressCount}×</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Moved to <span className="font-semibold text-foreground">In Review</span></span>
                <span className="ml-auto font-bold">{history.inReviewCount}×</span>
              </div>
              <div className="flex items-center gap-2 text-sm border-t border-border/30 pt-2 mt-1">
                <span className="text-muted-foreground">Total status changes</span>
                <span className="ml-auto font-bold">{history.totalChanges}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              disabled={closing}
              onClick={handleClose}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, close portal'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
