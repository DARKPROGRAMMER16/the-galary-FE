import StatusBadge, { type VideoStatus } from './StatusBadge'

export interface VideoItem {
  id: string
  title: string
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
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
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

        {/* Status badge */}
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
        <div>
          <h3 className="font-headline font-bold text-lg text-on-surface">{video.title}</h3>
          <p className="text-sm text-secondary font-body mt-1">{video.meta}</p>
        </div>
        <button
          className="p-2 hover:bg-surface-container-low rounded-lg text-outline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  )
}
