import { useState, useRef, useEffect } from 'react'
import StatusBadge, { type VideoStatus } from './StatusBadge'

export interface VideoItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  meta: string
  status: VideoStatus
  thumbnail?: string
  thumbnailGradient?: string
  videoUrl?: string
  quality?: string
  views?: string
  publishedAt?: string
}

interface VideoCardProps {
  video: VideoItem
  onClick?: (video: VideoItem) => void
  onEdit?: (video: VideoItem) => void
  onDelete?: (video: VideoItem) => void
}

export default function VideoCard({ video, onClick, onEdit, onDelete }: VideoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  return (
    <div className="group cursor-pointer" onClick={() => onClick?.(video)}>
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform duration-300 group-hover:-translate-y-1">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: video.thumbnailGradient ?? 'linear-gradient(135deg, #4355b9, #535f78)' }}
          />
        )}

        <div className="absolute top-4 right-4">
          <StatusBadge status={video.status} />
        </div>

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 rounded-full bg-surface/80 backdrop-blur-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <h3 className="font-headline font-bold text-lg text-on-surface truncate">{video.title}</h3>
          <p className="text-sm text-secondary font-body mt-1 truncate">{video.meta}</p>
        </div>

        {/* 3-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            className="p-2 hover:bg-surface-container-low rounded-lg text-outline transition-colors"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            aria-label="Video options"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-20">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit?.(video)
                }}
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit details
              </button>
              <div className="h-px bg-outline-variant/10 mx-3" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete?.(video)
                }}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
