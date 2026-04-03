import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: string
  right?: ReactNode
}

export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.5rem] font-bold font-headline leading-tight tracking-tight text-on-surface">
          {title}
        </h2>
        {subtitle && (
          <p className="text-secondary mt-2 max-w-md font-body text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      {right && <div className="w-full md:w-auto shrink-0">{right}</div>}
    </header>
  )
}
