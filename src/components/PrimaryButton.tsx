import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export default function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`indigo-gradient text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-[0.98] active:scale-95 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
