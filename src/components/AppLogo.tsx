interface AppLogoProps {
  subtitle?: string
}

export default function AppLogo({ subtitle }: AppLogoProps) {
  return (
    <div className="flex flex-col items-center mb-10">
      <div className="w-16 h-16 indigo-gradient rounded-xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
        <span
          className="material-symbols-outlined text-on-primary text-4xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          light_mode
        </span>
      </div>
      <h1 className="font-headline text-3xl font-bold tracking-tight text-on-background">
        The Galary
      </h1>
      {subtitle && (
        <p className="text-on-surface-variant mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  )
}
