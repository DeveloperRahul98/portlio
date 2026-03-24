'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Copy, CheckCircle2, Clock, Receipt, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Client, Project, STATUS_CONFIG } from '@/lib/types'
import { useState } from 'react'

type InvoiceSummary = { payment_proof_url: string | null; status: string }

interface PortalCardProps {
  client: Client & { projects: (Project & { invoices: InvoiceSummary[] })[] }
  index: number
}

export function PortalCard({ client, index }: PortalCardProps) {
  const [copied, setCopied] = useState(false)
  const project = client.projects?.[0]
  const status = project?.status ?? 'kickoff'
  const statusConfig = STATUS_CONFIG[status]
  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${client.portal_slug}`

  const isClosed = client.is_closed ?? false
  const invoice = project?.invoices?.[0]
  const hasPaymentProof = !isClosed && invoice?.payment_proof_url && invoice?.status === 'sent'

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={`/dashboard/${client.portal_slug}`}>
        <div
          className="relative glass-card glass-card-hover rounded-2xl p-5 cursor-pointer overflow-hidden"
          style={{ borderLeft: `3px solid ${client.accent_color}` }}
        >
          {/* Accent glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.04] blur-2xl pointer-events-none"
            style={{ background: client.accent_color }}
          />

          {/* Payment proof banner */}
          {hasPaymentProof && (
            <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
              <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-400">Payment proof received</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: `linear-gradient(135deg, ${client.accent_color}, ${client.accent_color}bb)` }}
              >
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{client.name}</div>
                {client.company && (
                  <div className="text-xs text-muted-foreground truncate">{client.company}</div>
                )}
              </div>
            </div>

            {isClosed ? (
              <Badge className="text-xs font-medium shrink-0 border border-border/50 bg-muted/50 text-muted-foreground gap-1">
                <Lock className="w-2.5 h-2.5" />
                Closed
              </Badge>
            ) : (
              <Badge
                className="text-xs font-medium shrink-0 border"
                style={{
                  color: statusConfig.color,
                  borderColor: `${statusConfig.color}35`,
                  background: `${statusConfig.color}12`,
                }}
              >
                {statusConfig.label}
              </Badge>
            )}
          </div>

          {/* Project title */}
          {project && (
            <div className="text-sm font-medium mb-3 truncate text-foreground/90">{project.title}</div>
          )}

          {/* Status progress */}
          <div className="flex gap-1 mb-4">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div
                key={key}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background: config.step <= statusConfig.step
                    ? client.accent_color
                    : 'var(--border)',
                  opacity: config.step <= statusConfig.step ? 1 : 0.35,
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {project
                ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                : formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyLink}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                title={copied ? 'Copied!' : 'Copy portal link'}
              >
                {copied
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  : <Copy className="w-3.5 h-3.5" />
                }
              </button>
              <div className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
