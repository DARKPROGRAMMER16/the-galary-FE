import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import VideoCard, { type VideoItem } from '../components/VideoCard'
import VideoPlayerModal from '../components/VideoPlayerModal'
import { useVideos } from '../contexts/VideoContext'
import type { Video } from '../types/api.types'

function mapVideoToItem(v: Video): VideoItem {
  return {
    id: v._id,
    title: v.title,
    meta: v.description || v.originalName,
    status: v.status,
    videoUrl: v.videoUrl,
    thumbnail: v.thumbnailUrl ?? undefined,
    quality: v.resolution?.width
      ? v.resolution.width >= 3840 ? '4K'
        : v.resolution.width >= 1920 ? '1080p' : '720p'
      : undefined,
    publishedAt: new Date(v.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative group">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
        search
      </span>
      <input
        type="text"
        placeholder="Search assets..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-6 py-4 w-full md:w-72 bg-surface-container-highest rounded-xl border-none focus:ring-0 focus:bg-surface-container-lowest transition-all font-body text-on-surface placeholder:text-outline-variant outline-none"
      />
    </div>
  )
}

export default function LibraryPage() {
  const { videos, isLoading, error, fetchVideos } = useVideos()
  const [search, setSearch] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const items = videos.map(mapVideoToItem)
  const filtered = items.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageHeader
        title="Video Library"
        subtitle="Curation and management of your cinematic assets, organized by timeline and status."
        right={<SearchInput value={search} onChange={setSearch} />}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-3">progress_activity</span>
          Loading your library…
        </div>
      )}

      {error && !isLoading && (
        <div className="px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined text-5xl mb-4">video_library</span>
          <p className="text-base font-medium">No videos yet. Upload your first one!</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} onClick={setActiveVideo} />
          ))}
        </div>
      )}

      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  )
}
