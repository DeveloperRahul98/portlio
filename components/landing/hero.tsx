'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react'

const floatingCards = [
  { label: 'Design Phase', status: 'In Review', color: '#F97316', delay: 0 },
  { label: 'Website Redesign', status: 'Complete', color: '#10B981', delay: 0.3 },
  { label: 'Brand Identity', status: 'In Progress', color: '#6366F1', delay: 0.6 },
]

export function Hero() {
  return (
    <section className="relative min-h-[86vh] flex items-center overflow-hidden mesh-bg">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-16 w-full grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3 h-3" />
            Built for freelancers & agencies
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black leading-[1.06] tracking-tight mb-4"
          >
            Your clients deserve{' '}
            <span className="gradient-text">a beautiful</span>{' '}
            experience.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-base text-muted-foreground leading-relaxed mb-5 max-w-lg"
          >
            Share one branded link with your client. They see project status, updates, files, and invoices — no login, no friction, no email chaos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] transition-all group text-base px-8 font-semibold"
              >
                Start for free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-foreground/25 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-all text-base px-8"
              >
                See how it works
              </Button>
            </Link>
          </motion.div>

          {/* Trust signals + stats combined */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.36 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {['Free forever plan', 'No credit card needed', 'Setup in 2 minutes'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '2 min', label: 'Setup time' },
                { value: '100%', label: 'No-login for clients' },
                { value: '∞', label: 'Free portals' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/6 border border-primary/12"
                >
                  <span className="text-lg font-black text-foreground leading-none">{s.value}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Portal preview mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative hidden lg:flex items-center justify-center"
        >
          <div className="relative w-full max-w-sm">
            {/* Main card */}
            <div className="gradient-border p-5 space-y-3 animate-pulse-glow">
              {/* Portal header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  AC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">Acme Corp</div>
                  <div className="text-xs text-muted-foreground">Website Redesign</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                  Complete
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Project Progress</div>
                  <div className="text-xs font-semibold text-emerald-400">100%</div>
                </div>
                <div className="flex gap-1.5">
                  {['Kickoff', 'In Progress', 'Review', 'Complete'].map((phase) => (
                    <div
                      key={phase}
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: '#10B981' }}
                    />
                  ))}
                </div>
              </div>

              {/* Updates */}
              <div className="space-y-1.5">
                {[
                  { text: 'Final designs delivered ✓', time: '2h ago' },
                  { text: 'Client review completed', time: '1d ago' },
                ].map((update, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/25 border border-border/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate font-medium">{update.text}</div>
                      <div className="text-xs text-muted-foreground">{update.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* File */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/25 border border-border/30">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">PDF</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">final_designs.pdf</div>
                  <div className="text-xs text-muted-foreground">2.4 MB</div>
                </div>
              </div>
            </div>

            {/* Floating status cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + card.delay }}
                className="absolute glass-card rounded-xl px-3 py-2 shadow-xl"
                style={{
                  top: `${18 + i * 28}%`,
                  right: i % 2 === 0 ? '-60px' : undefined,
                  left: i % 2 !== 0 ? '-48px' : undefined,
                  borderLeft: `3px solid ${card.color}`,
                  animation: `float ${4 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                <div className="text-xs font-semibold whitespace-nowrap">{card.label}</div>
                <div className="text-xs font-medium" style={{ color: card.color }}>{card.status}</div>
              </motion.div>
            ))}
          </div>

          {/* Review badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute -bottom-4 -right-4 glass-card rounded-2xl px-3 py-2.5 shadow-xl flex items-center gap-2"
          >
            <div className="flex -space-x-1">
              {['#6366F1', '#10B981', '#F97316'].map((c) => (
                <div key={c} className="w-5 h-5 rounded-full border-2 border-card" style={{ background: c }} />
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold">Loved by freelancers</div>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-2 h-2 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
