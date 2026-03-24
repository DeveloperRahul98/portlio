'use client'

import { useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        copied
          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
          : 'border-primary/40 text-primary bg-primary/10 hover:bg-primary/20'
      }`}
    >
      {copied
        ? <><CheckCircle2 className="w-3.5 h-3.5" />Copied!</>
        : <><Copy className="w-3.5 h-3.5" />Copy link</>
      }
    </button>
  )
}
