export type QueueState = 'uploading' | 'transcoding'

export interface QueueItemData {
  id: string
  name: string
  size: string
  timeRemaining: string
  progress: number
  state: QueueState
  thumbnailGradient?: string
}

interface QueueItemProps {
  item: QueueItemData
  onRemove: (id: string) => void
}

const stateIcon: Record<QueueState, { icon: string; pulse: boolean }> = {
  uploading:   { icon: 'hourglass_top', pulse: true  },
  transcoding: { icon: 'sync',          pulse: false },
}

export default function QueueItem({ item, onRemove }: QueueItemProps) {
  const { icon, pulse } = stateIcon[item.state]

  return (
    <div className="group p-4 sm:p-5 rounded-2xl bg-surface-container-lowest transition-all hover:shadow-lg hover:shadow-on-surface/5 flex items-center gap-3 sm:gap-6">
      {/* Thumbnail — hidden on xs */}
      <div className="relative h-16 w-24 sm:h-20 sm:w-36 rounded-xl overflow-hidden shrink-0 hidden xs:block sm:block">
        <div
          className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
          style={{ background: item.thumbnailGradient ?? 'linear-gradient(135deg, #4355b9, #535f78)' }}
        />
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <span className={`material-symbols-outlined text-white ${pulse ? 'animate-pulse' : ''}`}>
            {icon}
          </span>
        </div>
      </div>

      {/* Info + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2 gap-2">
          <h5 className="font-semibold text-on-surface truncate text-sm">{item.name}</h5>
          <span className="text-xs font-medium text-primary shrink-0">{item.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">{item.size}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 hidden sm:inline">{item.timeRemaining}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-on-surface-variant hover:text-error transition-colors shrink-0"
        aria-label="Remove from queue"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}
