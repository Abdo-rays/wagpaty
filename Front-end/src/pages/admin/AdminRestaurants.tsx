import { useState } from 'react'
import { Search, CheckCircle, XCircle, Trash2, ToggleLeft, ToggleRight, ShieldOff, Shield } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { adminApi } from '../../lib/api/admin.api'
import { useLang } from '../../context/LanguageContext'

export default function AdminRestaurants() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => adminApi.getRestaurants())
  const [search, setSearch] = useState('')

  const filtered = (data || []).filter((r: any) =>
    r.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  )

  const act = async (fn: () => Promise<any>) => { try { await fn(); refetch() } catch {} }

  return (
    <div>
      <TopBar title={t('restaurants')} subtitle={`${(data || []).length} registered restaurants`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
              className="input-base pl-9" />
          </div>
          <span className="text-sm text-fg3">{filtered.length} results</span>
        </div>

        {loading ? <Spinner text={t('loading')} /> : filtered.length === 0 ? (
          <div className="text-center py-16 text-fg3">
            <Store size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t('noData')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r: any) => (
              <div key={r._id} className="admin-restaurant-card card p-5 flex items-center gap-4 anim-fade" style={{ flexWrap: 'wrap' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-alt">
                  {r.logo ? <img src={r.logo} alt={r.restaurantName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-fg3">{r.restaurantName?.charAt(0)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{r.restaurantName}</h3>
                    <span className="font-mono text-xs text-fg3 px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>{r.code}</span>
                    <StatusBadge status={r.isBanned ? 'banned' : r.isApproved ? (r.isActive ? 'active' : 'inactive') : 'pending'} />
                  </div>
                  <p className="text-sm text-fg2 mt-0.5">{r.category} · {r.address}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-fg3">
                    <span>📦 {r.totalOrders || 0} orders</span>
                    <span>💰 EGP {r.totalRevenue?.toLocaleString() || 0}</span>
                    <span>⭐ {r.rating?.toFixed(1) || '—'}</span>
                    <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!r.isApproved && !r.isBanned && (
                    <>
                      <button onClick={() => act(() => adminApi.approveRestaurant(r._id))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <CheckCircle size={12} /> {t('approve')}
                      </button>
                      <button onClick={() => {
                        const reason = prompt('Enter rejection reason:')
                        if (reason?.trim()) act(() => adminApi.rejectRestaurant(r._id, { reason: reason.trim() }))
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <XCircle size={12} /> {t('reject')}
                      </button>
                    </>
                  )}
                  {r.isApproved && !r.isBanned && (
                    <button onClick={() => act(() => adminApi.toggleRestaurantStatus(r._id, { isActive: !r.isActive }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                      style={{ background: 'var(--bg-alt)', borderColor: 'var(--card-border)', color: 'var(--fg-2)' }}>
                      {r.isActive ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} />}
                      {r.isActive ? 'Disable' : 'Enable'}
                    </button>
                  )}
                  <button onClick={async () => {
                    if (r.isBanned) return act(() => adminApi.unbanRestaurant(r._id))
                    const reason = prompt('Enter reason for ban:')
                    if (!reason || !reason.trim()) return alert('Ban reason is required')
                    await act(() => adminApi.banRestaurant(r._id, { reason }))
                  }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: r.isBanned ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: r.isBanned ? '#10B981' : '#F59E0B' }}>
                    {r.isBanned ? <Shield size={14} /> : <ShieldOff size={14} />}
                  </button>
                  <button onClick={() => { if (confirm('Delete this restaurant?')) act(() => adminApi.deleteRestaurant(r._id)) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Store({ size, className }: any) {
  return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
}
