import Link from 'next/link'
import Image from 'next/image'

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 mt-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16 mb-10">
          {/* Brand */}
          <div className="flex-1 min-w-0 flex flex-col items-center md:items-start">
            <Link href="/" className="inline-flex items-center group mb-4">
              <Image src="/logo-dark.png" alt="Portlio" width={669} height={373} className="dark:block hidden" style={{ height: '100px', width: 'auto' }} />
              <Image src="/logo-light.png" alt="Portlio" width={669} height={373} className="dark:hidden block" style={{ height: '100px', width: 'auto' }} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs text-center md:text-left">
              Beautiful client portals for freelancers and agencies. Share everything in one link.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 sm:gap-16 shrink-0 justify-center md:justify-start">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">{group}</div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Portlio. Built for freelancers who want to impress clients.
          </p>
          <Link
            href="/signup"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </div>
    </footer>
  )
}
