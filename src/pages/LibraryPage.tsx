import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import PageHeader from '../components/PageHeader'
import VideoCard, { type VideoItem } from '../components/VideoCard'
import VideoPlayerModal from '../components/VideoPlayerModal'
import { useVideos } from '../contexts/VideoContext'
import { useAuth } from '../contexts/AuthContext'
import { getOrgUsersApi } from '../api/org.api'
import { assignVideoApi } from '../api/video.api'
import type { Video, User } from '../types/api.types'

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
    assignedTo: v.assignedTo ?? [],
    organisation: v.organisation,
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
  const [titleError, setTitleError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) { setTitleError('Title is required.'); return }
    setTitleError('')
    setSaving(true)
    try {
      await onSave(video.id, { title: title.trim(), description, tags })
      toast.success('Video details updated.')
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save changes.'
      toast.error(message)
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

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError('') }}
              className={`w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface font-body outline-none transition-all ${titleError ? 'ring-2 ring-error' : 'focus:ring-2 focus:ring-primary'}`}
              placeholder="Video title"
              autoFocus
            />
            {titleError && <p className="text-xs text-error mt-1.5">{titleError}</p>}
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
      toast.success('Video deleted.')
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to delete video.'
      toast.error(message)
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

// ─── Assign modal ──────────────────────────────────────────────────────────────

interface AssignModalProps {
  video: VideoItem
  organisation: string
  onClose: () => void
  onSave: (id: string, viewerIds: string[]) => Promise<void>
}

function AssignModal({ video, organisation, onClose, onSave }: AssignModalProps) {
  const [viewers, setViewers] = useState<User[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set(video.assignedTo ?? []))
  const [loadingViewers, setLoadingViewers] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingViewers(true)
    getOrgUsersApi(organisation)
      .then((users) => {
        if (!cancelled) setViewers(users.filter((u) => u.role === 'viewer'))
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load viewers.')
      })
      .finally(() => { if (!cancelled) setLoadingViewers(false) })
    return () => { cancelled = true }
  }, [organisation])

  function toggleViewer(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(video.id, Array.from(selected))
      toast.success('Assignment saved.')
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to assign video.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 flex items-center justify-center p-6">
      <div
        className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-semibold text-xl text-on-background">Assign viewers</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
          Select which viewers can see <span className="font-semibold text-on-surface">"{video.title}"</span>.
        </p>

        {loadingViewers ? (
          <div className="flex items-center justify-center py-8 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading viewers…
          </div>
        ) : viewers.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-on-surface-variant opacity-60">
            <span className="material-symbols-outlined text-3xl mb-2">person_search</span>
            <p className="text-sm">No viewers in this organisation yet.</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto mb-6 -mx-2 px-2">
            {viewers.map((viewer) => {
              const checked = selected.has(viewer._id)
              return (
                <button
                  key={viewer._id}
                  onClick={() => toggleViewer(viewer._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    checked
                      ? 'bg-primary-container/40 text-on-surface'
                      : 'hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? 'bg-primary border-primary' : 'border-outline-variant'
                  }`}>
                    {checked && <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontSize: '14px' }}>check</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-on-background">{viewer.name}</p>
                    <p className="text-xs opacity-60 truncate">{viewer.email}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loadingViewers}
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-dim transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { videos, isLoading, error, fetchVideos, removeVideo, editVideo } = useVideos()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<VideoItem | null>(null)

  // Track local assignment state so the modal reflects latest saved values
  const [assignedMap, setAssignedMap] = useState<Record<string, string[]>>({})

  // Debounce search — wait 350 ms after the user stops typing before hitting the API
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchVideos({ search: search.trim() || undefined })
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchVideos])

  // Sync assignedMap from fresh server data
  useEffect(() => {
    const map: Record<string, string[]> = {}
    videos.forEach((v) => { map[v._id] = v.assignedTo ?? [] })
    setAssignedMap(map)
  }, [videos])

  const canManage = user?.role === 'admin' || user?.role === 'editor'

  const items = videos.map((v) => ({
    ...mapVideoToItem(v),
    assignedTo: assignedMap[v._id] ?? v.assignedTo ?? [],
  }))

  async function handleAssignSave(id: string, viewerIds: string[]) {
    const updated = await assignVideoApi(id, viewerIds)
    setAssignedMap((prev) => ({ ...prev, [id]: updated.assignedTo ?? [] }))
  }

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

      {!isLoading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined text-5xl mb-4">video_library</span>
          <p className="text-base font-medium">
            {search.trim()
              ? `No videos match "${search}".`
              : user?.role === 'viewer'
              ? 'No videos have been assigned to you yet.'
              : 'No videos yet. Upload your first one!'}
          </p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={setActiveVideo}
              onEdit={canManage ? setEditTarget : undefined}
              onDelete={canManage ? setDeleteTarget : undefined}
              onAssign={canManage ? setAssignTarget : undefined}
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

      {/* Assign modal */}
      {assignTarget && (
        <AssignModal
          video={assignTarget}
          organisation={assignTarget.organisation ?? user?.organisation ?? ''}
          onClose={() => setAssignTarget(null)}
          onSave={handleAssignSave}
        />
      )}
    </>
  )
}
