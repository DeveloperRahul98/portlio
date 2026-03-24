'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Plus } from 'lucide-react'
import Link from 'next/link'

const ACCENT_COLORS = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#06B6D4', label: 'Cyan' },
]

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Math.random().toString(36).slice(2, 7)
}

export default function NewPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    company: '',
    projectTitle: '',
    projectDescription: '',
    accentColor: '#6366F1',
  })

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = generateSlug(form.clientName)

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: form.clientName,
        email: form.clientEmail || null,
        company: form.company || null,
        portal_slug: slug,
        accent_color: form.accentColor,
      })
      .select()
      .single()

    if (clientError || !client) {
      setError(clientError?.message ?? 'Failed to create portal')
      setLoading(false)
      return
    }

    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: client.id,
        title: form.projectTitle,
        description: form.projectDescription || null,
        status: 'kickoff',
      })

    if (projectError) {
      setError(projectError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/${slug}`)
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to portals
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">New Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Create a new portal</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Fill in the details below. You can always edit them later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client section */}
          <section className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-sm tracking-wide text-foreground/80 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-xs font-black text-primary">1</span>
              Client Info
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm font-medium">Client name <span className="text-destructive">*</span></Label>
                <Input
                  id="clientName"
                  placeholder="Acme Corp"
                  value={form.clientName}
                  onChange={(e) => set('clientName', e.target.value)}
                  required
                  className="bg-background/60 border-border/60 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  className="bg-background/60 border-border/60 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="text-sm font-medium">Client email <span className="text-muted-foreground font-normal">(for notifications)</span></Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                value={form.clientEmail}
                onChange={(e) => set('clientEmail', e.target.value)}
                className="bg-background/60 border-border/60 h-10"
              />
            </div>
          </section>

          {/* Project section */}
          <section className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-sm tracking-wide text-foreground/80 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-xs font-black text-primary">2</span>
              Project Details
            </h2>

            <div className="space-y-2">
              <Label htmlFor="projectTitle" className="text-sm font-medium">Project title <span className="text-destructive">*</span></Label>
              <Input
                id="projectTitle"
                placeholder="Website Redesign"
                value={form.projectTitle}
                onChange={(e) => set('projectTitle', e.target.value)}
                required
                className="bg-background/60 border-border/60 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="projectDescription"
                placeholder="A brief overview of the project..."
                value={form.projectDescription}
                onChange={(e) => set('projectDescription', e.target.value)}
                className="bg-background/60 border-border/60 resize-none"
                rows={3}
              />
            </div>
          </section>

          {/* Color section */}
          <section className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-sm tracking-wide text-foreground/80 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-xs font-black text-primary">3</span>
              Portal Color
            </h2>
            <p className="text-xs text-muted-foreground -mt-1">This color themes the entire client portal experience.</p>

            <div className="flex items-center gap-2.5 flex-wrap">
              {ACCENT_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('accentColor', value)}
                  title={label}
                  className="w-9 h-9 rounded-xl transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    background: value,
                    boxShadow: form.accentColor === value ? `0 0 0 3px ${value}50, 0 0 0 5px ${value}20` : 'none',
                    transform: form.accentColor === value ? 'scale(1.15)' : undefined,
                  }}
                >
                  {form.accentColor === value && (
                    <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div
              className="rounded-xl border p-3.5 flex items-center gap-3"
              style={{ borderColor: `${form.accentColor}30`, background: `${form.accentColor}06` }}
            >
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${form.accentColor}, ${form.accentColor}99)` }}
              >
                {form.clientName?.slice(0, 2).toUpperCase() || '—'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{form.clientName || 'Client Name'}</div>
                <div className="text-xs text-muted-foreground truncate">{form.projectTitle || 'Project Title'}</div>
              </div>
              <div className="ml-auto text-xs font-semibold shrink-0" style={{ color: form.accentColor }}>Kickoff</div>
            </div>
          </section>

          {error && (
            <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all text-base group font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create portal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
