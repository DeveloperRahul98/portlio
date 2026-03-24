'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Invoice, InvoiceLineItem, InvoiceStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Loader2, CheckCircle2, Send, FileText, Upload, ImageIcon, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceViewProps {
  projectId: string
  initialInvoice: Invoice | null
  accentColor: string
  readonly?: boolean
  closed?: boolean
}

const STATUS_STYLES: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
  sent: { label: 'Sent', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  paid: { label: 'Paid', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR — Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD — US Dollar' },
]

const WORKFLOW_STEPS = [
  { status: 'draft', label: 'Draft', hint: 'Add line items & save' },
  { status: 'sent', label: 'Sent', hint: 'Client can view & upload proof' },
  { status: 'paid', label: 'Paid', hint: 'Payment confirmed' },
]

function WorkflowStepper({ currentStatus, accentColor }: { currentStatus: InvoiceStatus; accentColor: string }) {
  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.status === currentStatus)
  return (
    <div className="flex items-center gap-0 mb-4">
      {WORKFLOW_STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                style={
                  isDone
                    ? { background: '#10B98122', borderColor: '#10B981', color: '#10B981' }
                    : isActive
                    ? { background: `${accentColor}20`, borderColor: accentColor, color: accentColor }
                    : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                }
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-center">
                <div className={`text-xs font-semibold ${isActive ? 'text-foreground' : isDone ? 'text-emerald-400' : 'text-muted-foreground/50'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground/40 hidden sm:block leading-tight max-w-20 text-center">
                  {step.hint}
                </div>
              </div>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-2 mb-5 transition-all"
                style={{ background: i < currentIndex ? '#10B98150' : 'var(--border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function InvoiceView({ projectId, initialInvoice, accentColor, readonly, closed }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(initialInvoice)
  const [saving, setSaving] = useState(false)
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initialInvoice?.line_items ?? [{ description: '', amount: 0 }]
  )
  const [notes, setNotes] = useState(initialInvoice?.notes ?? '')
  const [currency, setCurrency] = useState(initialInvoice?.currency ?? 'INR')
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(initialInvoice?.payment_proof_url ?? null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const proofInputRef = useRef<HTMLInputElement>(null)

  const total = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₹'

  const addLine = () => setLineItems([...lineItems, { description: '', amount: 0 }])
  const removeLine = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: 'description' | 'amount', value: string | number) => {
    const updated = [...lineItems]
    updated[i] = { ...updated[i], [field]: value }
    setLineItems(updated)
  }

  const saveInvoice = async (newStatus?: InvoiceStatus) => {
    setSaving(true)
    const supabase = createClient()
    const status = newStatus ?? invoice?.status ?? 'draft'
    const payload = { project_id: projectId, line_items: lineItems, total, currency, notes: notes || null, status }

    if (invoice) {
      const { data, error } = await supabase.from('invoices').update(payload).eq('id', invoice.id).select().single()
      if (!error && data) {
        setInvoice(data)
        toast.success(newStatus ? `Invoice marked as ${STATUS_STYLES[newStatus].label}` : 'Invoice saved')
      } else {
        toast.error('Failed to save invoice')
      }
    } else {
      const { data, error } = await supabase.from('invoices').insert(payload).select().single()
      if (!error && data) {
        setInvoice(data)
        toast.success('Invoice created as draft')
      } else {
        toast.error('Failed to create invoice')
      }
    }
    setSaving(false)
  }

  const uploadPaymentProof = async (file: File) => {
    if (!invoice) return
    setUploadingProof(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${projectId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error('Failed to upload proof')
      setUploadingProof(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(path)
    const { error: updateError } = await supabase.from('invoices').update({ payment_proof_url: publicUrl }).eq('id', invoice.id)

    if (!updateError) {
      setPaymentProofUrl(publicUrl)
      setInvoice(prev => prev ? { ...prev, payment_proof_url: publicUrl } : prev)
      toast.success('Payment proof uploaded successfully')
    } else {
      toast.error('Failed to save proof')
    }
    setUploadingProof(false)
  }

  // Client readonly view
  if (readonly) {
    if (!invoice || invoice.status === 'draft') {
      return (
        <div className="text-center py-14 text-muted-foreground">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-sm font-medium">No invoice available yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Invoice</h3>
          <Badge className={`${STATUS_STYLES[invoice.status].className} border text-xs`}>
            {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {STATUS_STYLES[invoice.status].label}
          </Badge>
        </div>

        <div className="space-y-1">
          {invoice.line_items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30">
              <span className="text-sm">{item.description}</span>
              <span className="text-sm font-medium tabular-nums">
                {currencySymbol} {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between py-3 rounded-xl px-4 font-bold text-lg"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}22` }}
        >
          <span>Total</span>
          <span style={{ color: accentColor }} className="tabular-nums">
            {currencySymbol} {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {invoice.notes && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 leading-relaxed">
            {invoice.notes}
          </div>
        )}

        {/* Payment proof — only when not closed and invoice is sent */}
        {!closed && invoice.status === 'sent' && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-sm font-semibold">Upload Payment Proof</span>
            </div>
            {paymentProofUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-emerald-400 font-medium">Proof submitted — awaiting confirmation</span>
                </div>
                <a href={paymentProofUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="w-3 h-3" />View uploaded proof
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot or receipt as proof of payment. Your freelancer will verify and confirm.
                </p>
                <input ref={proofInputRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadPaymentProof(file) }} />
                <Button size="sm" variant="outline" disabled={uploadingProof}
                  onClick={() => proofInputRef.current?.click()}
                  className="border-border/50 text-sm" style={{ borderColor: `${accentColor}35` }}>
                  {uploadingProof
                    ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Uploading...</>
                    : <><ImageIcon className="w-3.5 h-3.5 mr-2" />Choose screenshot or PDF</>}
                </Button>
              </div>
            )}
          </div>
        )}

        {invoice.status === 'paid' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-emerald-400 font-medium">Payment confirmed by your freelancer</span>
          </div>
        )}
      </div>
    )
  }

  // Freelancer edit view
  return (
    <div className="space-y-5">
      {/* Workflow stepper — always visible */}
      <WorkflowStepper currentStatus={invoice?.status ?? 'draft'} accentColor={accentColor} />

      {invoice && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Invoice status</span>
          <div className="flex items-center gap-2">
            <Badge className={`${STATUS_STYLES[invoice.status].className} border text-xs`}>
              {STATUS_STYLES[invoice.status].label}
            </Badge>
            {!closed && invoice.status === 'draft' && (
              <Button size="sm" variant="outline" onClick={() => saveInvoice('sent')} disabled={saving}
                className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                <Send className="w-3 h-3 mr-1" />Mark as Sent
              </Button>
            )}
            {!closed && invoice.status === 'sent' && (
              <Button size="sm" variant="outline" onClick={() => saveInvoice('paid')} disabled={saving}
                className="text-xs h-7 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                <CheckCircle2 className="w-3 h-3 mr-1" />Mark as Paid
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Payment proof section — shown for sent/paid invoices */}
      {invoice && invoice.status !== 'draft' && (
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}22` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-sm font-semibold">Payment Proof</span>
            </div>
            {paymentProofUrl && invoice.status === 'sent' && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs">Awaiting review</Badge>
            )}
            {paymentProofUrl && invoice.status === 'paid' && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />Verified
              </Badge>
            )}
          </div>
          {paymentProofUrl ? (
            <>
              <p className="text-xs text-muted-foreground">
                {invoice.status === 'sent'
                  ? 'Client has uploaded proof of payment. Review it and mark as paid.'
                  : 'Payment proof submitted by client.'}
              </p>
              <a href={paymentProofUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: accentColor }}>
                <ExternalLink className="w-3 h-3" />View payment proof
              </a>
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">No proof uploaded by client yet.</p>
          )}
        </div>
      )}

      {/* Currency selector */}
      {!closed && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Currency</span>
          <div className="flex gap-1.5">
            {CURRENCIES.map((c) => (
              <button key={c.code} onClick={() => setCurrency(c.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  currency === c.code
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                }`}>
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Line items */}
      {!closed && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-muted-foreground px-1">
            <span>Description</span><span>Amount ({currency})</span><span />
          </div>
          {lineItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-[1fr_120px_36px] gap-2 items-center">
              <Input placeholder="Service description" value={item.description}
                onChange={(e) => updateLine(i, 'description', e.target.value)}
                className="bg-background/60 border-border/50 h-9 text-sm" />
              <Input type="number" placeholder="0.00" value={item.amount || ''}
                onChange={(e) => updateLine(i, 'amount', parseFloat(e.target.value) || 0)}
                className="bg-background/60 border-border/50 h-9 text-sm" min="0" step="0.01" />
              <button onClick={() => removeLine(i)} disabled={lineItems.length === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
          <button onClick={addLine}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-1 py-1">
            <Plus className="w-3.5 h-3.5" />Add line item
          </button>
        </div>
      )}

      {/* Read-only line items when closed */}
      {closed && (
        <div className="space-y-1">
          {lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30">
              <span className="text-sm">{item.description}</span>
              <span className="text-sm font-medium tabular-nums">
                {currencySymbol} {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3 font-bold"
        style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}18` }}>
        <span>Total</span>
        <span style={{ color: accentColor }} className="tabular-nums">
          {currencySymbol} {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Notes */}
      {!closed && (
        <Textarea placeholder="Payment terms, bank details, or notes for your client..."
          value={notes} onChange={(e) => setNotes(e.target.value)}
          className="bg-background/60 border-border/50 resize-none text-sm" rows={3} />
      )}
      {closed && notes && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 leading-relaxed">{notes}</div>
      )}

      {!closed && (
        <Button onClick={() => saveInvoice()} disabled={saving}
          className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/15 transition-all font-medium">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save invoice'}
        </Button>
      )}
    </div>
  )
}
