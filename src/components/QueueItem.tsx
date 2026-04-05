import { useEffect, useRef, useState } from 'react'

export type QueueState = 'uploading' | 'transcoding'

export interface QueueItemData {
  id: string
  videoId?: string   // set after upload resolves — used to key into processingLogs
  name: string
  size: string
  timeRemaining: string
  progress: number
  state: QueueState
  thumbnailGradient?: string
}

interface QueueItemProps {
  item: QueueItemData
  logs?: string[]    // live log lines from VideoContext.processingLogs[videoId]
  onRemove: (id: string) => void
}

const stateIcon: Record<QueueState, { icon: string; pulse: boolean }> = {
  uploading:   { icon: 'hourglass_top', pulse: true  },
  transcoding: { icon: 'sync',          pulse: false },
}

export default function QueueItem({ item, logs, onRemove }: QueueItemProps) {
  const { icon, pulse } = stateIcon[item.state]
  const [logsOpen, setLogsOpen] = useState(true)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the newest log line
  useEffect(() => {
    if (logsOpen) logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, logsOpen])

  const showLogs = item.state === 'transcoding' && logs && logs.length > 0

  return (
    <div className="rounded-2xl bg-surface-container-lowest overflow-hidden transition-all hover:shadow-lg hover:shadow-on-surface/5">
      {/* Main row */}
      <div className="group p-4 sm:p-5 flex items-center gap-3 sm:gap-6">
        {/* Thumbnail */}
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

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle logs button — only shown when logs are available */}
          {showLogs && (
            <button
              onClick={() => setLogsOpen((v) => !v)}
              title={logsOpen ? 'Hide analysis logs' : 'Show analysis logs'}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {logsOpen ? 'terminal' : 'terminal'}
              </span>
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-on-surface-variant hover:text-error transition-colors"
            aria-label="Remove from queue"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Log terminal — shown during transcoding/analysis */}
      {showLogs && logsOpen && (
        <div className="mx-4 mb-4 rounded-xl bg-[#0f1117] border border-outline-variant/10 overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary/70" />
            </div>
            <span className="text-[10px] font-mono text-white/30 ml-1 uppercase tracking-widest">
              sensitivity analysis — live log
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-tertiary/70 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              live
            </span>
          </div>

          {/* Log lines */}
          <div className="px-4 py-3 max-h-48 overflow-y-auto space-y-1 font-mono">
            {logs.map((line, i) => (
              <p key={i} className="text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap">
                <span className="text-white/20 mr-2 select-none">{String(i + 1).padStart(2, '0')}</span>
                {line}
              </p>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}
