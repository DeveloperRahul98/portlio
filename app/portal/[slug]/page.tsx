export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusTracker } from '@/components/portal/status-tracker'
import { UpdatesFeed } from '@/components/portal/updates-feed'
import { FilesSection } from '@/components/portal/files-section'
import { InvoiceView } from '@/components/portal/invoice-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectStatus, STATUS_CONFIG } from '@/lib/types'
import { Lock, CheckCircle2, MessageSquare, FileText, Receipt } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: client } = await supabase.from('clients').select('*, projects(title)').eq('portal_slug', slug).single()
  if (!client) return { title: 'Portal Not Found' }
  const projectTitle = (client.projects as { title: string }[])?.[0]?.title
  return {
    title: `${projectTitle ?? 'Project'} — ${client.name} | Portlio`,
    description: `Your project portal for ${projectTitle}`,
  }
}

export default async function ClientPortalPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('portal_slug', slug)
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
    supabase.from('invoices').select('*').eq('project_id', project.id).neq('status', 'draft').maybeSingle(),
  ])

  const color = client.accent_color
  const isClosed = client.is_closed ?? false
  const statusConfig = STATUS_CONFIG[project.status as ProjectStatus]

  return (
    <div
      className="portal-view min-h-screen bg-background"
      style={{ '--portal-accent': color } as React.CSSProperties}
    >
      {/* Top accent stripe */}
      <div className="w-full h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}88, ${color}33)` }} />

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${color}20 0%, ${color}0c 35%, transparent 65%)`,
          borderBottom: `1px solid ${color}25`,
        }}
      >
        {/* Background orbs */}
        <div
          className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ background: color, opacity: 0.12 }}
        />
        <div
          className="absolute top-12 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: color, opacity: 0.07 }}
        />

        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14 relative z-10">
          {/* Project header */}
          <div className="flex items-start gap-4 sm:gap-5 mb-8">
            <div
              className="rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0"
              style={{
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                boxShadow: `0 8px 32px ${color}55, 0 0 0 1px ${color}33`,
              }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {client.name}{client.company ? ` · ${client.company}` : ''}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${color}18`,
                    color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {project.status === 'complete' && <CheckCircle2 className="w-3 h-3" />}
                  {statusConfig.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{project.title}</h1>
              {project.description && (
                <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed max-w-lg">{project.description}</p>
              )}
            </div>
          </div>

          {/* Status tracker card */}
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{
              background: 'var(--card)',
              border: `1px solid ${color}28`,
              boxShadow: `0 4px 24px ${color}10`,
            }}
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: `${color}cc` }}
            >
              Project Progress
            </div>
            <StatusTracker
              projectId={project.id}
              currentStatus={project.status as ProjectStatus}
              accentColor={color}
              readonly
            />
          </div>
        </div>
      </div>

      {/* Closed banner */}
      {isClosed && (
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-5">
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
            style={{
              background: `${color}0e`,
              border: `1px solid ${color}28`,
            }}
          >
            <Lock
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color }}
            />
            <div>
              <p className="text-sm font-semibold">This portal has been closed</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The project is complete. You can still view all updates, files, and your invoice below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
        <Tabs defaultValue="updates">
          <TabsList
            className="portal-tabs mb-6 p-1 h-auto gap-1 rounded-xl w-full sm:w-auto"
            style={{
              background: 'var(--card)',
              border: `1px solid ${color}22`,
            }}
          >
            {[
              { value: 'updates', label: 'Updates', count: updates?.length, icon: MessageSquare },
              { value: 'files', label: 'Files', count: files?.length, icon: FileText },
              { value: 'invoice', label: 'Invoice', icon: Receipt },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="portal-tab-trigger flex-1 sm:flex-none text-sm px-4 py-2 rounded-lg capitalize transition-all font-medium text-muted-foreground data-[state=active]:text-white"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold portal-tab-badge"
                    style={{ background: `${color}22`, color }}
                  >
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="updates">
            <UpdatesFeed
              projectId={project.id}
              initialUpdates={updates ?? []}
              accentColor={color}
              clientName={client.name}
              closed={isClosed}
              readonly
            />
          </TabsContent>

          <TabsContent value="files">
            <FilesSection
              projectId={project.id}
              initialFiles={files ?? []}
              accentColor={color}
              portalSlug={slug}
              readonly
            />
          </TabsContent>

          <TabsContent value="invoice">
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'var(--card)',
                border: `1px solid ${color}22`,
                boxShadow: `0 4px 20px ${color}08`,
              }}
            >
              <InvoiceView
                projectId={project.id}
                initialInvoice={invoice ?? null}
                accentColor={color}
                closed={isClosed}
                readonly
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pb-10">
        <div
          className="flex items-center justify-center py-5 border-t"
          style={{ borderColor: `${color}18` }}
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            Powered by
            <Image src="/logo-dark.png" alt="Portlio" width={669} height={373} className="dark:block hidden opacity-60 group-hover:opacity-90 transition-opacity" style={{ height: '100px', width: 'auto' }} />
            <Image src="/logo-light.png" alt="Portlio" width={669} height={373} className="dark:hidden block opacity-60 group-hover:opacity-90 transition-opacity" style={{ height: '100px', width: 'auto' }} />
          </a>
        </div>
      </div>
    </div>
  )
}
