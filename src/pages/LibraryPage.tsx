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
    description: v.description,
    tags: v.tags,
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

// ─── Edit modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  video: VideoItem
  onClose: () => void
  onSave: (id: string, payload: { title: string; description: string; tags: string }) => Promise<void>
}

function EditModal({ video, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description ?? '')
  const [tags, setTags] = useState(video.tags?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave(video.id, { title: title.trim(), description, tags })
      onClose()
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save changes.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 flex items-center justify-center p-6">
      <div
        className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-7">
          <h3 className="font-headline font-semibold text-xl text-on-background">Edit details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface font-body outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Video title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface font-body outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface font-body outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-on-surface-variant/60 mt-1.5">Separate tags with commas</p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-dim transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────

interface DeleteModalProps {
  video: VideoItem
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeleteModal({ video, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 flex items-center justify-center p-6">
      <div
        className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-error text-2xl">delete</span>
        </div>

        <h3 className="font-headline font-semibold text-xl text-on-background mb-2">
          Delete video?
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-7">
          <span className="font-semibold text-on-surface">"{video.title}"</span> will be permanently
          deleted from your library and removed from storage. This cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-error text-on-error font-bold hover:opacity-90 transition-all disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { videos, isLoading, error, fetchVideos, removeVideo, editVideo } = useVideos()
  const [search, setSearch] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null)

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
            <VideoCard
              key={video.id}
              video={video}
              onClick={setActiveVideo}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Video player */}
      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          video={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={async (id, payload) => {
            await editVideo(id, payload)
            setEditTarget(null)
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteModal
          video={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await removeVideo(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </>
  )
}
