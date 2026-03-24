'use client'

import { motion } from 'framer-motion'
import { Link2, FileText, Bell, Shield, Palette, Zap } from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'One link, everything inside',
    description: 'Share a single URL with your client. They instantly see project status, updates, files, and invoices — no account needed.',
    color: '#6366F1',
  },
  {
    icon: Palette,
    title: 'Branded to your project',
    description: 'Each portal gets a custom accent color. Your client opens a portal that feels like it was designed just for them.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'Live status tracking',
    description: 'Move projects through Kickoff → In Progress → Review → Complete. Clients always know where things stand.',
    color: '#F59E0B',
  },
  {
    icon: FileText,
    title: 'File sharing & invoices',
    description: 'Upload deliverables directly to the portal. Add invoice line items and mark them as sent — all in one place.',
    color: '#10B981',
  },
  {
    icon: Bell,
    title: 'Email notifications',
    description: 'Clients get notified when you post an update or change the project status. No more manual status emails.',
    color: '#F97316',
  },
  {
    icon: Shield,
    title: 'Zero friction for clients',
    description: "Clients don't sign up, download anything, or learn a new tool. They just open a link. That's it.",
    color: '#EC4899',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/2 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            Everything you need
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 mt-2">
            Built for how freelancers{' '}
            <span className="gradient-text">actually work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            No bloat. No learning curve. Just the features that save you time and impress your clients.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="glass-card glass-card-hover rounded-2xl p-6 group cursor-default"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}28` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-bold text-base mb-2 leading-snug">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
