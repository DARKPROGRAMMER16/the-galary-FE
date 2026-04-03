import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import VideoCard, { type VideoItem } from '../components/VideoCard'
import VideoPlayerModal from '../components/VideoPlayerModal'

const videos: VideoItem[] = [
  {
    id: '1',
    title: 'Dawn in the Cascades',
    meta: 'Edited 2 hours ago • 4K HDR',
    status: 'safe',
    quality: '4K HDR',
    publishedAt: 'Published 2 days ago',
    views: '12.4k Views',
    thumbnailGradient: 'linear-gradient(135deg, #1a3a4a 0%, #2d6a7a 50%, #4a9aa0 100%)',
    videoUrl: '/videos/videos/IMG_0590.MOV',
  },
  {
    id: '2',
    title: 'Urban Nocturne Vol. 2',
    meta: 'Uploading • 85% complete',
    status: 'processing',
    quality: '1080p',
    publishedAt: 'Published 5 days ago',
    views: '8.1k Views',
    thumbnailGradient: 'linear-gradient(135deg, #1a1040 0%, #3b1f6e 50%, #5f3d9e 100%)',
    videoUrl: '/videos/videos/IMG_0591.MOV',
  },
  {
    id: '3',
    title: 'Street Scene Uncut',
    meta: 'Review required • Copyright',
    status: 'flagged',
    quality: '4K',
    publishedAt: 'Published 1 week ago',
    views: '3.7k Views',
    thumbnailGradient: 'linear-gradient(135deg, #3a1a0a 0%, #7a3d1e 50%, #c46a30 100%)',
    videoUrl: '/videos/videos/IMG_0593.MOV',
  },
  {
    id: '4',
    title: 'Neon Geometry',
    meta: 'Edited yesterday • 1080p',
    status: 'safe',
    quality: '1080p',
    publishedAt: 'Published 3 days ago',
    views: '21.9k Views',
    thumbnailGradient: 'linear-gradient(135deg, #1a0a3a 0%, #5f1a7a 50%, #c030b0 100%)',
    videoUrl: '/videos/videos/IMG_0599.MOV',
  },
]

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
  const [search, setSearch] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageHeader
        title="Video Library"
        subtitle="Curation and management of your cinematic assets, organized by timeline and status."
        right={<SearchInput value={search} onChange={setSearch} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} onClick={setActiveVideo} />
        ))}
      </div>

      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  )
}
