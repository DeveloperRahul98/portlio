export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusTracker } from '@/components/portal/status-tracker'
import { UpdatesFeed } from '@/components/portal/updates-feed'
import { FilesSection } from '@/components/portal/files-section'
import { InvoiceView } from '@/components/portal/invoice-view'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import { ClosePortalButton } from '@/components/dashboard/close-portal-button'
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react'
import { ProjectStatus } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PortalManagePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('portal_slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .single()

  if (!project) notFound()

  const [{ data: updates }, { data: files }, { data: invoice }] = await Promise.all([
    supabase.from('updates').select('*, comments(*)').eq('project_id', project.id).order('created_at', { ascending: false }),
    supabase.from('files').select('*').eq('project_id', project.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('project_id', project.id).maybeSingle(),
  ])

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/portal/${slug}`
  const isClosed = client.is_closed ?? false

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to portals
      </Link>

      {/* Closed banner */}
      {isClosed && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
          <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-semibold">This portal is closed</p>
            <p className="text-xs text-muted-foreground">The client can no longer reply or upload payment proof. You can still view all data.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${client.accent_color}, ${client.accent_color}99)`,
              boxShadow: `0 4px 20px ${client.accent_color}40`,
            }}
          >
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black truncate">{client.name}</h1>
            <p className="text-muted-foreground text-sm truncate">{project.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!isClosed && <CopyLinkButton url={portalUrl} />}
          <Link
            href={`/portal/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </Link>
          {!isClosed && (
            <ClosePortalButton
              clientId={client.id}
              projectId={project.id}
              projectStatus={project.status}
            />
          )}
        </div>
      </div>

      {/* Status tracker */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Project Status
        </div>
        <StatusTracker
          projectId={project.id}
          currentStatus={project.status as ProjectStatus}
          accentColor={client.accent_color}
          readonly={isClosed}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="updates" className="space-y-5">
        <TabsList className="bg-card/60 border border-border/40 p-1 h-auto gap-1">
          {['updates', 'files', 'invoice'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="group capitalize text-sm px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              {tab}
              {tab === 'updates' && updates && updates.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white">
                  {updates.length}
                </span>
              )}
              {tab === 'files' && files && files.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white">
                  {files.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="updates" className="mt-0">
          <UpdatesFeed
            projectId={project.id}
            initialUpdates={updates ?? []}
            accentColor={client.accent_color}
            readonly={isClosed}
            closed={isClosed}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          <FilesSection
            projectId={project.id}
            initialFiles={files ?? []}
            accentColor={client.accent_color}
            portalSlug={slug}
            readonly={isClosed}
          />
        </TabsContent>

        <TabsContent value="invoice" className="mt-0">
          <div className="glass-card rounded-2xl p-5">
            <InvoiceView
              projectId={project.id}
              initialInvoice={invoice ?? null}
              accentColor={client.accent_color}
              closed={isClosed}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
