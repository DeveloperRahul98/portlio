'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutGrid, Plus, Settings, LogOut, Sun, Moon, Menu, TrendingUp
} from 'lucide-react'

interface SidebarProps {
  user: { email?: string; user_metadata?: { full_name?: string } }
}

const navItems = [
  { href: '/dashboard', label: 'Portals', icon: LayoutGrid },
  { href: '/dashboard/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function getIsActive(itemHref: string, pathname: string) {
  if (itemHref === '/dashboard/settings') {
    return pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')
  }
  if (itemHref === '/dashboard/revenue') {
    return pathname === '/dashboard/revenue' || pathname.startsWith('/dashboard/revenue/')
  }
  // Portals: active everywhere in dashboard EXCEPT settings and revenue
  return !pathname.startsWith('/dashboard/settings') && !pathname.startsWith('/dashboard/revenue')
}

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: SidebarProps['user']
  pathname: string
  onNavigate?: () => void
}) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center group mb-3"
      >
        <div className="overflow-hidden" style={{ height: '66px' }}>
          <Image src="/logo-dark.png" alt="Portlio" width={669} height={373} priority className="dark:block hidden" style={{ height: '100px', width: 'auto', marginTop: '-17px' }} />
          <Image src="/logo-light.png" alt="Portlio" width={669} height={373} priority className="dark:hidden block" style={{ height: '100px', width: 'auto', marginTop: '-17px' }} />
        </div>
      </Link>

      {/* New Portal CTA */}
      <Link href="/dashboard/new" onClick={onNavigate} className="mb-5">
        <Button className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all group text-sm font-semibold">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          New Portal
        </Button>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = getIsActive(item.href, pathname)
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border pt-4 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">
              {user?.user_metadata?.full_name || 'Your Account'}
            </div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border px-4 py-6 fixed top-0 left-0 z-40">
      <SidebarContent user={user} pathname={pathname} />
    </aside>
  )
}

export function MobileHeader({ user }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border/50 flex items-center justify-between h-14">
        <Link href="/dashboard" className="flex items-center group pl-4">
          <div className="overflow-hidden" style={{ height: '44px' }}>
            <Image src="/logo-dark.png" alt="Portlio" width={669} height={373} priority className="dark:block hidden" style={{ height: '68px', width: 'auto', marginTop: '-12px' }} />
            <Image src="/logo-light.png" alt="Portlio" width={669} height={373} priority className="dark:hidden block" style={{ height: '68px', width: 'auto', marginTop: '-12px' }} />
          </div>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors pr-3"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar border-sidebar-border p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="p-5 h-full">
            <SidebarContent
              user={user}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
