export type VideoStatus = 'safe' | 'processing' | 'flagged'

const config: Record<VideoStatus, { bg: string; text: string; dot: string; label: string }> = {
  safe:       { bg: 'bg-on-primary-container/90', text: 'text-on-primary',  dot: 'bg-primary-fixed-dim',                label: 'Safe'       },
  processing: { bg: 'bg-tertiary/90',             text: 'text-on-tertiary', dot: 'bg-tertiary-fixed animate-pulse',     label: 'Processing' },
  flagged:    { bg: 'bg-error/90',                text: 'text-on-error',    dot: 'bg-error-container',                  label: 'Flagged'    },
}

interface StatusBadgeProps {
  status: VideoStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, dot, label } = config[status]
  return (
    <div className={`${bg} ${text} px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-[10px] font-bold tracking-widest uppercase font-label">{label}</span>
    </div>
  )
}
