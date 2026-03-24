'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Zap, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying it out',
    features: [
      '1 active portal',
      'Project status tracking',
      'Updates feed',
      'File sharing (100MB)',
      'Invoice view',
      'Shareable client link',
    ],
    cta: 'Start for free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/month',
    description: 'For busy freelancers',
    features: [
      'Unlimited portals',
      'Everything in Free',
      '5GB file storage',
      'Email notifications',
      'Custom accent colors',
      'Priority support',
    ],
    cta: 'Start Pro trial',
    href: '/signup',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'White-label portal',
      'Custom domain',
      '20GB file storage',
      'Dedicated support',
    ],
    cta: 'Contact us',
    href: '/signup',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-14 sm:py-20">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/2 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 mt-2">
            Start free.{' '}
            <span className="gradient-text">Scale when ready.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            No contracts. Cancel anytime. Most freelancers start free and upgrade when they close their first deal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col transition-all ${
                plan.highlight
                  ? 'gradient-border scale-[1.03] shadow-2xl shadow-primary/15'
                  : 'glass-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30">
                  <Zap className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">{plan.name}</div>
                <div className="flex items-end gap-1 mb-1.5">
                  <span className="text-4xl font-black leading-none">{plan.price}</span>
                  <span className="text-muted-foreground text-sm pb-0.5">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      plan.highlight ? 'bg-primary/18' : 'bg-muted'
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full font-semibold transition-all group ${
                    plan.highlight
                      ? 'bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {plan.cta}
                  {plan.highlight && (
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
