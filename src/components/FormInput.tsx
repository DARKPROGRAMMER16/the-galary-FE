import type { ReactNode, InputHTMLAttributes } from 'react'

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string
  label: string
  icon?: string
  value: string
  onChange: (value: string) => void
  trailing?: ReactNode
  labelRight?: ReactNode
}

export default function FormInput({
  id,
  label,
  icon,
  value,
  onChange,
  trailing,
  labelRight,
  ...inputProps
}: FormInputProps) {
  const paddingLeft = icon ? 'pl-12' : 'px-4'
  const paddingRight = trailing ? 'pr-12' : icon ? 'pr-4' : ''

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label
          className="font-label text-xs font-medium uppercase tracking-widest text-on-surface-variant"
          htmlFor={id}
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-surface-container-highest border-none rounded-lg py-3.5 ${paddingLeft} ${paddingRight} focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#4355b9] transition-all duration-200 text-on-background placeholder:text-outline outline-none`}
          {...inputProps}
        />
        {trailing && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    </div>
  )
}
