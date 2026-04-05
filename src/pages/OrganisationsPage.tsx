import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getSuperAdminOrgsApi } from '../api/superadmin.api'
import type { Organisation } from '../types/api.types'

export default function OrganisationsPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<Organisation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setIsLoading(true)
    getSuperAdminOrgsApi()
      .then(setOrgs)
      .catch((err) =>
        setError(
          err?.response?.data?.message ?? 'Failed to load organisations.',
        ),
      )
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <PageHeader
        title="Organisations"
        subtitle="All organisations registered in the platform. Click one to manage its users and videos."
        right={
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search organisations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 w-full md:w-64 bg-surface-container-highest rounded-xl border-none focus:ring-0 focus:bg-surface-container-lowest transition-all font-body text-on-surface placeholder:text-outline-variant outline-none"
            />
          </div>
        }
      />

      {/* Stats */}
      {!isLoading && !error && (
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { label: 'Total organisations', value: orgs.length, icon: 'corporate_fare' },
            { label: 'Total members', value: orgs.reduce((s, o) => s + o.memberCount, 0), icon: 'group' },
            { label: 'Total videos', value: orgs.reduce((s, o) => s + o.videoCount, 0), icon: 'video_library' },
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

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-3">progress_activity</span>
          Loading organisations…
        </div>
      )}

      {error && !isLoading && (
        <div className="px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined text-5xl mb-4">corporate_fare</span>
          <p className="text-base font-medium">No organisations found.</p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((org) => (
            <button
              key={org.name}
              onClick={() => navigate(`/organisations/${encodeURIComponent(org.name)}`)}
              className="text-left p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-low transition-all group active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container text-xl">
                    corporate_fare
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                  arrow_forward
                </span>
              </div>

              <h3 className="font-headline font-bold text-lg text-on-background mb-3 truncate">
                {org.name}
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">group</span>
                  <span className="text-sm font-semibold">{org.memberCount}</span>
                  <span className="text-xs opacity-60">members</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">video_library</span>
                  <span className="text-sm font-semibold">{org.videoCount}</span>
                  <span className="text-xs opacity-60">videos</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
