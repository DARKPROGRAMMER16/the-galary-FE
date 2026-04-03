import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px]" />

        <div className="w-full max-w-120 z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
