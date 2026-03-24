import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Mail, Shield, Bell, Palette } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-4">
        {/* Profile card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-lg font-black text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{user.user_metadata?.full_name || 'Your Name'}</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming soon features */}
        {[
          { icon: Palette, title: 'Custom Branding', desc: 'Add your logo and custom colors to portals.' },
          { icon: Bell, title: 'Notification Preferences', desc: 'Control which emails you and your clients receive.' },
          { icon: Shield, title: 'Security & Billing', desc: 'Manage your subscription, payment method, and two-factor auth.' },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-2xl p-5 flex items-start gap-4 opacity-60">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {item.title}
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Soon</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
