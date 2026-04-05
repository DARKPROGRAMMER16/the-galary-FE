import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { getUsersApi, updateUserRoleApi, toggleUserStatusApi, deleteUserApi } from '../api/admin.api'
import { getOrgUsersApi, deleteOrgUserApi } from '../api/org.api'
import type { User } from '../types/api.types'

// ─── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: User['role'] }) {
  const styles: Record<User['role'], string> = {
    admin: 'bg-primary-container text-on-primary-container',
    editor: 'bg-secondary-container text-on-secondary-container',
    viewer: 'bg-surface-container-high text-on-surface-variant',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${styles[role]}`}>
      {role}
    </span>
  )
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
        isActive
          ? 'bg-tertiary-container text-on-tertiary-container'
          : 'bg-error-container text-on-error-container'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-tertiary' : 'bg-error'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Role selector (admin-only) ────────────────────────────────────────────────

interface RoleSelectProps {
  value: User['role']
  disabled: boolean
  onChange: (role: User['role']) => void
}

function RoleSelect({ value, disabled, onChange }: RoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as User['role'])}
      className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface text-sm font-body outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer pr-8"
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>
  )
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────

interface DeleteModalProps {
  user: User
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeleteModal({ user, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to delete user.'
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
          <span className="material-symbols-outlined text-error text-2xl">person_remove</span>
        </div>
        <h3 className="font-headline font-semibold text-xl text-on-background mb-2">
          Remove user?
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-7">
          <span className="font-semibold text-on-surface">{user.name}</span> ({user.email}) will be
          permanently removed from the organisation. This cannot be undone.
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
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── User row ──────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: User
  isSelf: boolean
  isAdmin: boolean          // whether the CURRENT user is admin (controls which actions to show)
  canDelete: boolean        // editor can only delete non-admins in their org
  onRoleChange?: (userId: string, role: User['role']) => Promise<void>
  onToggle?: (userId: string) => Promise<void>
  onDelete: (user: User) => void
  showOrg: boolean
}

function UserRow({ user, isSelf, isAdmin, canDelete, onRoleChange, onToggle, onDelete, showOrg }: UserRowProps) {
  const [roleLoading, setRoleLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const initial = user.name.charAt(0).toUpperCase()

  async function handleRoleChange(role: User['role']) {
    if (!onRoleChange) return
    setRoleLoading(true)
    try { await onRoleChange(user._id, role) }
    finally { setRoleLoading(false) }
  }

  async function handleToggle() {
    if (!onToggle) return
    setToggleLoading(true)
    try { await onToggle(user._id) }
    finally { setToggleLoading(false) }
  }

  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-outline-variant/15 last:border-0 hover:bg-surface-container-low/40 transition-colors">
      {/* Avatar + name/email */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="font-headline font-bold text-on-primary-container text-sm">{initial}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-on-background text-sm truncate">{user.name}</p>
            {isSelf && (
              <span className="text-xs text-primary font-semibold bg-primary-container/40 px-2 py-0.5 rounded-md">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant opacity-70 truncate">{user.email}</p>
          {showOrg && (
            <p className="text-xs text-on-surface-variant opacity-50 mt-0.5">{user.organisation}</p>
          )}
        </div>
      </div>

      {/* Status (admin only) */}
      {isAdmin && (
        <div className="sm:w-24 shrink-0">
          <StatusBadge isActive={user.isActive} />
        </div>
      )}

      {/* Role — selector for admin, badge for editor */}
      <div className="sm:w-32 shrink-0">
        {isAdmin ? (
          roleLoading ? (
            <span className="material-symbols-outlined animate-spin text-primary text-lg">progress_activity</span>
          ) : (
            <RoleSelect value={user.role} disabled={isSelf} onChange={handleRoleChange} />
          )
        ) : (
          <RoleBadge role={user.role} />
        )}
      </div>

      {/* Last login (admin only) */}
      {isAdmin && (
        <div className="hidden md:block sm:w-32 shrink-0">
          <p className="text-xs text-on-surface-variant opacity-60">{lastLogin}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-start sm:justify-end">
        {/* Toggle active — admin only */}
        {isAdmin && onToggle && (
          <button
            onClick={handleToggle}
            disabled={isSelf || toggleLoading}
            title={user.isActive ? 'Deactivate user' : 'Activate user'}
            className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              user.isActive
                ? 'text-on-surface-variant hover:bg-surface-container-high hover:text-error'
                : 'text-tertiary hover:bg-tertiary-container/40'
            }`}
          >
            {toggleLoading ? (
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">
                {user.isActive ? 'block' : 'check_circle'}
              </span>
            )}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(user)}
          disabled={isSelf || !canDelete}
          title={!canDelete ? 'Cannot delete admin users' : 'Remove user'}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Admin fetches all users across orgs; editor fetches only own org
      const data = isAdmin ? await getUsersApi() : await getOrgUsersApi()
      setUsers(data)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load users.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleRoleChange(userId: string, role: User['role']) {
    try {
      const updated = await updateUserRoleApi(userId, role)
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)))
      toast.success('Role updated.')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update role.'
      toast.error(message)
      throw err
    }
  }

  async function handleToggle(userId: string) {
    try {
      const updated = await toggleUserStatusApi(userId)
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)))
      toast.success(updated.isActive ? 'User activated.' : 'User deactivated.')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update status.'
      toast.error(message)
      throw err
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    if (isAdmin) {
      await deleteUserApi(deleteTarget._id)
    } else {
      await deleteOrgUserApi(deleteTarget._id)
    }
    setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id))
    toast.success('User removed.')
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
  }

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={
          isAdmin
            ? 'Manage all organisation members, their roles, and account status.'
            : 'Manage members of your organisation.'
        }
        right={
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 w-full md:w-72 bg-surface-container-highest rounded-xl border-none focus:ring-0 focus:bg-surface-container-lowest transition-all font-body text-on-surface placeholder:text-outline-variant outline-none"
            />
          </div>
        }
      />

      {/* Stats row — admin only */}
      {isAdmin && !isLoading && !error && (
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { label: 'Total members', value: stats.total, icon: 'group' },
            { label: 'Active', value: stats.active, icon: 'check_circle' },
            { label: 'Admins', value: stats.admins, icon: 'admin_panel_settings' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4 bg-surface-container-low rounded-2xl">
              <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
              <div>
                <p className="text-2xl font-bold font-headline text-on-background leading-none">{value}</p>
                <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-3">progress_activity</span>
          Loading members…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
          {/* Table header */}
          <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-surface-container-low/60 border-b border-outline-variant/15">
            <div className="flex-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
              Member
            </div>
            {isAdmin && (
              <div className="w-24 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                Status
              </div>
            )}
            <div className="w-32 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
              Role
            </div>
            {isAdmin && (
              <div className="hidden md:block w-32 text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                Last login
              </div>
            )}
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 text-right">
              Actions
            </div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-4xl mb-3">person_search</span>
              <p className="text-sm font-medium">No members found.</p>
            </div>
          ) : (
            filtered.map((u) => {
              const isSelf = u._id === currentUser?._id
              // Editor can delete non-admin users; admin can delete anyone except self
              const canDelete = isAdmin
                ? !isSelf
                : !isSelf && u.role !== 'admin'
              return (
                <UserRow
                  key={u._id}
                  user={u}
                  isSelf={isSelf}
                  isAdmin={isAdmin}
                  canDelete={canDelete}
                  onRoleChange={isAdmin ? handleRoleChange : undefined}
                  onToggle={isAdmin ? handleToggle : undefined}
                  onDelete={setDeleteTarget}
                  showOrg={isAdmin}
                />
              )
            })
          )}
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await handleDelete()
            setDeleteTarget(null)
          }}
        />
      )}
    </>
  )
}
