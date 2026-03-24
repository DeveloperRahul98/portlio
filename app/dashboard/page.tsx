import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalCard } from '@/components/dashboard/portal-card'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, LayoutGrid } from 'lucide-react'
import { Client, Project } from '@/lib/types'

type InvoiceSummary = { payment_proof_url: string | null; status: string }
type ClientWithData = Client & { projects: (Project & { invoices: InvoiceSummary[] })[] }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects(*, invoices(payment_proof_url, status))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const typedClients = (clients ?? []) as ClientWithData[]
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || null

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="border-b border-border/60 bg-card/30">
        <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Portals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {firstName ? `Hey, ${firstName} 👋` : 'Your Portals'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {typedClients.length === 0
                ? 'Create your first portal to get started'
                : `${typedClients.length} portal${typedClients.length !== 1 ? 's' : ''} — share links with your clients`}
            </p>
          </div>
          <Link href="/dashboard/new" className="sm:shrink-0">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all group font-semibold">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              New Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-8 py-6 flex-1">
        {typedClients.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {typedClients.map((client, i) => (
              <PortalCard key={client.id} client={client} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/18 flex items-center justify-center mb-5 animate-pulse-glow">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">No portals yet</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-6 leading-relaxed">
        Create your first client portal and share a beautiful project experience in seconds.
      </p>
      <Link href="/dashboard/new">
        <Button className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 group font-semibold">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Create your first portal
        </Button>
      </Link>
    </div>
  )
}
