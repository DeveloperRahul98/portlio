export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, IndianRupee, DollarSign, Users, Calendar } from 'lucide-react'

interface InvoiceRow {
  total: number
  currency: string
  created_at: string
  status: string
}

interface ClientRevenue {
  id: string
  name: string
  accent_color: string
  total_inr: number
  total_usd: number
  invoice_count: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function RevenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, accent_color, projects(id, invoices(total, currency, status, created_at))')
    .eq('user_id', user.id)

  // Flatten all paid invoices
  type RawInvoice = InvoiceRow & { clientId: string; clientName: string; accentColor: string }
  const allPaidInvoices: RawInvoice[] = []

  for (const client of clients ?? []) {
    const projects = (client as { projects?: { invoices?: InvoiceRow[] }[] }).projects ?? []
    for (const project of projects) {
      for (const inv of project.invoices ?? []) {
        if (inv.status === 'paid') {
          allPaidInvoices.push({
            ...inv,
            clientId: (client as { id: string }).id,
            clientName: (client as { name: string }).name,
            accentColor: (client as { accent_color: string }).accent_color,
          })
        }
      }
    }
  }

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()

  // This month totals
  const thisMonthInvoices = allPaidInvoices.filter(inv => {
    const d = new Date(inv.created_at)
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth
  })
  const thisMonthINR = thisMonthInvoices.filter(i => i.currency === 'INR').reduce((s, i) => s + i.total, 0)
  const thisMonthUSD = thisMonthInvoices.filter(i => i.currency === 'USD').reduce((s, i) => s + i.total, 0)

  // This year totals
  const thisYearInvoices = allPaidInvoices.filter(inv => new Date(inv.created_at).getFullYear() === thisYear)
  const thisYearINR = thisYearInvoices.filter(i => i.currency === 'INR').reduce((s, i) => s + i.total, 0)
  const thisYearUSD = thisYearInvoices.filter(i => i.currency === 'USD').reduce((s, i) => s + i.total, 0)

  // Monthly breakdown for current year (INR)
  const monthlyINR = Array.from({ length: 12 }, (_, m) => {
    const total = thisYearInvoices
      .filter(inv => new Date(inv.created_at).getMonth() === m && inv.currency === 'INR')
      .reduce((s, i) => s + i.total, 0)
    return { month: MONTHS[m], total }
  })
  const maxMonthlyINR = Math.max(...monthlyINR.map(m => m.total), 1)

  // Per-client revenue
  const clientRevMap: Record<string, ClientRevenue> = {}
  for (const inv of allPaidInvoices) {
    if (!clientRevMap[inv.clientId]) {
      clientRevMap[inv.clientId] = {
        id: inv.clientId,
        name: inv.clientName,
        accent_color: inv.accentColor,
        total_inr: 0,
        total_usd: 0,
        invoice_count: 0,
      }
    }
    if (inv.currency === 'INR') clientRevMap[inv.clientId].total_inr += inv.total
    if (inv.currency === 'USD') clientRevMap[inv.clientId].total_usd += inv.total
    clientRevMap[inv.clientId].invoice_count++
  }
  const clientRevenues = Object.values(clientRevMap).sort((a, b) => (b.total_inr + b.total_usd * 84) - (a.total_inr + a.total_usd * 84))

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Revenue</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Revenue Overview</h1>
      <p className="text-muted-foreground text-sm mb-8">All revenue from paid invoices</p>

      {allPaidInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/18 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-primary opacity-50" />
          </div>
          <h2 className="text-lg font-bold mb-2">No revenue yet</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Revenue appears here once you mark invoices as paid.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* This month */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">This Month</span>
              </div>
              {thisMonthINR > 0 && (
                <div className="flex items-end gap-1">
                  <IndianRupee className="w-5 h-5 text-primary mb-0.5" />
                  <span className="text-3xl font-black text-foreground">{fmt(thisMonthINR)}</span>
                  <span className="text-sm text-muted-foreground mb-1 ml-1">INR</span>
                </div>
              )}
              {thisMonthUSD > 0 && (
                <div className="flex items-end gap-1">
                  <DollarSign className="w-5 h-5 text-emerald-400 mb-0.5" />
                  <span className="text-3xl font-black text-foreground">{fmt(thisMonthUSD)}</span>
                  <span className="text-sm text-muted-foreground mb-1 ml-1">USD</span>
                </div>
              )}
              {thisMonthINR === 0 && thisMonthUSD === 0 && (
                <p className="text-sm text-muted-foreground italic">No revenue this month yet</p>
              )}
              <p className="text-xs text-muted-foreground">{thisMonthInvoices.length} paid invoice{thisMonthInvoices.length !== 1 ? 's' : ''}</p>
            </div>

            {/* This year */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">This Year ({thisYear})</span>
              </div>
              {thisYearINR > 0 && (
                <div className="flex items-end gap-1">
                  <IndianRupee className="w-5 h-5 text-primary mb-0.5" />
                  <span className="text-3xl font-black text-foreground">{fmt(thisYearINR)}</span>
                  <span className="text-sm text-muted-foreground mb-1 ml-1">INR</span>
                </div>
              )}
              {thisYearUSD > 0 && (
                <div className="flex items-end gap-1">
                  <DollarSign className="w-5 h-5 text-emerald-400 mb-0.5" />
                  <span className="text-3xl font-black text-foreground">{fmt(thisYearUSD)}</span>
                  <span className="text-sm text-muted-foreground mb-1 ml-1">USD</span>
                </div>
              )}
              {thisYearINR === 0 && thisYearUSD === 0 && (
                <p className="text-sm text-muted-foreground italic">No revenue this year yet</p>
              )}
              <p className="text-xs text-muted-foreground">{thisYearInvoices.length} paid invoice{thisYearInvoices.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Monthly bar chart (INR) */}
          {thisYearINR > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Monthly Breakdown — {thisYear} (INR)</span>
              </div>
              <div className="space-y-2.5">
                {monthlyINR.map((m, i) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className={`text-xs w-7 shrink-0 ${i === thisMonth ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {m.month}
                    </span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
                      {m.total > 0 && (
                        <div
                          className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                          style={{
                            width: `${Math.max((m.total / maxMonthlyINR) * 100, 4)}%`,
                            background: i === thisMonth
                              ? 'linear-gradient(90deg, var(--primary), oklch(0.65 0.22 264))'
                              : 'oklch(0.45 0.12 264 / 0.5)',
                          }}
                        >
                          <span className="text-xs font-semibold text-white truncate">
                            ₹{m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right tabular-nums shrink-0">
                      {m.total > 0 ? `₹${fmt(m.total)}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-client breakdown */}
          {clientRevenues.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Revenue by Client</span>
              </div>
              <div className="space-y-3">
                {clientRevenues.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${c.accent_color}, ${c.accent_color}99)` }}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.invoice_count} paid invoice{c.invoice_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {c.total_inr > 0 && (
                        <div className="text-sm font-bold tabular-nums">₹{fmt(c.total_inr)}</div>
                      )}
                      {c.total_usd > 0 && (
                        <div className="text-sm font-bold tabular-nums text-emerald-400">${fmt(c.total_usd)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
