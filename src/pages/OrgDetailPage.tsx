import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  getSuperAdminOrgUsersApi,
  getSuperAdminOrgVideosApi,
  superAdminUpdateRoleApi,
  superAdminToggleStatusApi,
  superAdminDeleteUserApi,
  superAdminDeleteVideoApi,
} from '../api/superadmin.api'
import { assignVideoApi } from '../api/video.api'
import { getOrgUsersApi } from '../api/org.api'
import type { User, Video } from '../types/api.types'
import StatusBadge from '../components/StatusBadge'

// ─── Shared helpers ────────────────────────────────────────────────────────────

// function RoleBadge({ role }: { role: User['role'] }) {
//   const styles: Record<string, string> = {
//     admin: 'bg-primary-container text-on-primary-container',
//     editor: 'bg-secondary-container text-on-secondary-container',
//     viewer: 'bg-surface-container-high text-on-surface-variant',
//   }
//   return (
//     <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${styles[role] ?? ''}`}>
//       {role}
//     </span>
//   )
// }

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${isActive ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-tertiary' : 'bg-error'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function ConfirmModal({
  title, body, confirmLabel, danger, onClose, onConfirm,
}: {
  title: string; body: string; confirmLabel: string; danger?: boolean
  onClose: () => void; onConfirm: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  async function handleConfirm() {
    setLoading(true)
    try { await onConfirm(); onClose() }
    catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.')
    } finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-headline font-semibold text-xl text-on-background mb-2">{title}</h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-7">{body}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition-all">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className={`flex-1 py-3 rounded-xl font-bold transition-all disabled:opacity-60 ${danger ? 'bg-error text-on-error hover:opacity-90' : 'bg-primary text-on-primary hover:bg-primary-dim'}`}>
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Assign modal ──────────────────────────────────────────────────────────────

function AssignModal({ video, org, onClose, onSaved }: { video: Video; org: string; onClose: () => void; onSaved: (updated: Video) => void }) {
  const [viewers, setViewers] = useState<User[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set(video.assignedTo ?? []))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getOrgUsersApi(org)
      .then((users) => setViewers(users.filter((u) => u.role === 'viewer')))
      .catch(() => toast.error('Failed to load viewers.'))
      .finally(() => setLoading(false))
  }, [org])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await assignVideoApi(video._id, Array.from(selected))
      onSaved(updated)
      toast.success('Assignment saved.')
      onClose()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to assign.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-semibold text-xl">Assign viewers</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="text-sm text-on-surface-variant mb-5">Select viewers for <span className="font-semibold text-on-surface">"{video.title}"</span>.</p>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-on-surface-variant"><span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>Loading…</div>
        ) : viewers.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant opacity-60 text-sm">No viewers in this organisation.</div>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto mb-5 -mx-2 px-2">
            {viewers.map((v) => {
              const checked = selected.has(v._id)
              return (
                <button key={v._id} onClick={() => setSelected((p) => { const n = new Set(p); checked ? n.delete(v._id) : n.add(v._id); return n })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${checked ? 'bg-primary-container/40' : 'hover:bg-surface-container-low'}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                    {checked && <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 14 }}>check</span>}
                  </div>
                  <div className="min-w-0"><p className="text-sm font-semibold truncate text-on-background">{v.name}</p><p className="text-xs opacity-60 truncate">{v.email}</p></div>
                </button>
              )
            })}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-dim transition-all disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab({ org }: { org: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [roleLoading, setRoleLoading] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null)
    try { setUsers(await getSuperAdminOrgUsersApi(org)) }
    catch (err: unknown) { setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load.') }
    finally { setLoading(false) }
  }, [org])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleRoleChange(userId: string, role: User['role']) {
    setRoleLoading(userId)
    try {
      const updated = await superAdminUpdateRoleApi(userId, role)
      setUsers((p) => p.map((u) => u._id === userId ? updated : u))
      toast.success('Role updated.')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.')
    } finally { setRoleLoading(null) }
  }

  async function handleToggle(userId: string) {
    setToggleLoading(userId)
    try {
      const updated = await superAdminToggleStatusApi(userId)
      setUsers((p) => p.map((u) => u._id === userId ? updated : u))
      toast.success(updated.isActive ? 'User activated.' : 'User deactivated.')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.')
    } finally { setToggleLoading(null) }
  }

  if (loading) return <div className="flex items-center justify-center py-16 text-on-surface-variant"><span className="material-symbols-outlined animate-spin mr-3">progress_activity</span>Loading members…</div>
  if (error) return <div className="px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
  if (users.length === 0) return <div className="flex flex-col items-center py-16 text-on-surface-variant opacity-60"><span className="material-symbols-outlined text-4xl mb-3">person_search</span><p className="text-sm">No members in this organisation.</p></div>

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-surface-container-low/60 border-b border-outline-variant/15">
          <div className="flex-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Member</div>
          <div className="w-24 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Status</div>
          <div className="w-32 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Role</div>
          <div className="w-20 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 text-right">Actions</div>
        </div>

        {users.map((u) => (
          <div key={u._id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-outline-variant/15 last:border-0 hover:bg-surface-container-low/40 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="font-headline font-bold text-on-primary-container text-sm">{u.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-on-background truncate">{u.name}</p>
                <p className="text-xs text-on-surface-variant opacity-70 truncate">{u.email}</p>
              </div>
            </div>

            <div className="sm:w-24"><UserStatusBadge isActive={u.isActive} /></div>

            <div className="sm:w-32">
              {roleLoading === u._id ? (
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              ) : (
                <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value as User['role'])}
                  className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface text-sm font-body outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer pr-7"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 sm:w-20 justify-start sm:justify-end">
              <button onClick={() => handleToggle(u._id)} disabled={toggleLoading === u._id} title={u.isActive ? 'Deactivate' : 'Activate'}
                className={`p-2 rounded-lg transition-all disabled:opacity-40 ${u.isActive ? 'text-on-surface-variant hover:bg-surface-container-high hover:text-error' : 'text-tertiary hover:bg-tertiary-container/40'}`}>
                {toggleLoading === u._id ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">{u.isActive ? 'block' : 'check_circle'}</span>}
              </button>
              <button onClick={() => setDeleteTarget(u)} title="Delete user" className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-all">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Remove user?"
          body={`${deleteTarget.name} (${deleteTarget.email}) will be permanently removed.`}
          confirmLabel="Remove"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await superAdminDeleteUserApi(deleteTarget._id)
            setUsers((p) => p.filter((u) => u._id !== deleteTarget._id))
            toast.success('User removed.')
          }}
        />
      )}
    </>
  )
}

// ─── Videos tab ────────────────────────────────────────────────────────────────

function VideosTab({ org }: { org: string }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null)
  const [assignTarget, setAssignTarget] = useState<Video | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    getSuperAdminOrgVideosApi(org)
      .then((data) => setVideos(data.videos))
      .catch((err: unknown) => setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load.'))
      .finally(() => setLoading(false))
  }, [org])

  if (loading) return <div className="flex items-center justify-center py-16 text-on-surface-variant"><span className="material-symbols-outlined animate-spin mr-3">progress_activity</span>Loading videos…</div>
  if (error) return <div className="px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
  if (videos.length === 0) return <div className="flex flex-col items-center py-16 text-on-surface-variant opacity-60"><span className="material-symbols-outlined text-4xl mb-3">video_library</span><p className="text-sm">No videos in this organisation.</p></div>

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {videos.map((v) => (
          <div key={v._id} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
            <div className="relative aspect-video bg-surface-container-high">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #4355b9, #535f78)' }} />
              )}
              <div className="absolute top-3 right-3"><StatusBadge status={v.status} /></div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-headline font-bold text-on-background truncate">{v.title}</p>
                  <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setAssignTarget(v)} title="Assign viewers" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                  </button>
                  <button onClick={() => setDeleteTarget(v)} title="Delete video" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete video?"
          body={`"${deleteTarget.title}" will be permanently deleted from storage. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await superAdminDeleteVideoApi(deleteTarget._id)
            setVideos((p) => p.filter((v) => v._id !== deleteTarget._id))
            toast.success('Video deleted.')
          }}
        />
      )}

      {assignTarget && (
        <AssignModal
          video={assignTarget}
          org={org}
          onClose={() => setAssignTarget(null)}
          onSaved={(updated) => setVideos((p) => p.map((v) => v._id === updated._id ? updated : v))}
        />
      )}
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OrgDetailPage() {
  const { org } = useParams<{ org: string }>()
  const navigate = useNavigate()
  const orgName = decodeURIComponent(org ?? '')
  const [tab, setTab] = useState<'users' | 'videos'>('users')

  return (
    <>
      {/* Back + header */}
      <div className="mb-8 md:mb-12">
        <button
          onClick={() => navigate('/organisations')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4 text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          All Organisations
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-2xl">corporate_fare</span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline leading-tight tracking-tight text-on-surface">
              {orgName}
            </h2>
            <p className="text-secondary text-sm font-body mt-1">Organisation management</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-container-low p-1 rounded-xl w-fit">
        {(['users', 'videos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {t === 'users' ? 'group' : 'video_library'}
              </span>
              {t === 'users' ? 'Members' : 'Videos'}
            </span>
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab org={orgName} />}
      {tab === 'videos' && <VideosTab org={orgName} />}
    </>
  )
}
