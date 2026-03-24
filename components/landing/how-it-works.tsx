'use client'

import { motion } from 'framer-motion'
import { UserPlus, Settings2, Share2 } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Sign up in seconds',
    description: 'Create your free Portlio account with just an email and password. No credit card, no onboarding questionnaire.',
    color: '#6366F1',
  },
  {
    icon: Settings2,
    step: '02',
    title: "Build your client's portal",
    description: 'Add the client name, project title, and pick an accent color. Post your first update, upload files, and add invoice details.',
    color: '#8B5CF6',
  },
  {
    icon: Share2,
    step: '03',
    title: "Send the link — that's it",
    description: 'Copy the portal link and share it. Your client opens a beautiful, branded page showing everything in real time.',
    color: '#10B981',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            Simple by design
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 mt-2">
            Up and running in{' '}
            <span className="gradient-text">under 3 minutes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            We optimized every step so you can start impressing clients immediately.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-12 left-[calc(50%+48px)] right-[calc(-50%+48px)] h-px"
                  style={{ background: `linear-gradient(90deg, ${step.color}40, ${steps[i + 1].color}40)` }}
                />
              )}

              {/* Icon */}
              <div
                className="relative w-24 h-24 rounded-2xl flex items-center justify-center mb-6 z-10"
                style={{
                  background: `${step.color}12`,
                  border: `1px solid ${step.color}25`,
                  boxShadow: `0 8px 32px ${step.color}12`,
                }}
              >
                <step.icon className="w-10 h-10" style={{ color: step.color }} />
                <span
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </span>
              </div>

              <h3 className="font-bold text-xl mb-3 leading-snug">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
