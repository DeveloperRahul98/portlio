import { Navbar } from '@/components/landing/navbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden mesh-bg">
      <Navbar />
      <div className="h-full flex items-center justify-center px-5 pt-16 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
