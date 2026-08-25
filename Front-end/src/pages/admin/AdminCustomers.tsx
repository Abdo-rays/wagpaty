import { useState } from 'react'
import { Search, Trash2, ToggleLeft, ToggleRight, ShieldOff, Shield } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { adminApi } from '../../lib/api/admin.api'
import { useLang } from '../../context/LanguageContext'

export default function AdminCustomers() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => adminApi.getCustomers())
  const [search, setSearch] = useState('')

  const filtered = (data || []).filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const act = async (fn: () => Promise<any>) => { try { await fn(); refetch() } catch {} }

  return (
    <div>
      <TopBar title={t('customers')} subtitle={`${(data || []).length} registered customers`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="input-base pl-9" />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="card overflow-hidden">
            <div className="responsive-table"><table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Customer', 'Code', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-fg3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c._id} className="table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                          {c.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-fg">{c.name}</p>
                          <p className="text-xs text-fg3">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-fg3">{c.code}</td>
                    <td className="px-5 py-4 text-fg2 text-xs">{c.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.isBanned ? 'banned' : c.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-4 text-fg3 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => act(() => adminApi.toggleCustomerStatus(c._id, { isActive: !c.isActive }))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>
                          {c.isActive ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} className="text-fg3" />}
                        </button>
                        <button onClick={() => {
                          if (c.isBanned) return act(() => adminApi.unbanCustomer(c._id))
                          const reason = prompt('Enter reason for ban:')
                          if (reason?.trim()) act(() => adminApi.banCustomer(c._id, { reason: reason.trim() }))
                        }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: c.isBanned ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: c.isBanned ? '#10B981' : '#F59E0B' }}>
                          {c.isBanned ? <Shield size={14} /> : <ShieldOff size={14} />}
                        </button>
                        <button onClick={() => { if (confirm('Delete this customer?')) act(() => adminApi.deleteCustomer(c._id)) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            {filtered.length === 0 && <div className="py-12 text-center text-fg3">{t('noData')}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
