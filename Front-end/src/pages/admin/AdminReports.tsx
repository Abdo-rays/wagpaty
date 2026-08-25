import { useState } from 'react'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { reportsApi } from '../../lib/api/reports.api'
import { useLang } from '../../context/LanguageContext'

export default function AdminReports() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => reportsApi.getAdminReports())
  const [filter, setFilter] = useState('all')

  const filtered = (data || []).filter((r: any) => filter === 'all' || r.status === filter)

  const act = async (fn: () => Promise<any>) => { try { await fn(); refetch() } catch {} }

  return (
    <div>
      <TopBar title={t('reports')} subtitle={`${(data || []).length} total reports`} />
      <div className="p-6 space-y-5">
        <div className="flex gap-2">
          {['all', 'pending', 'reviewed', 'dismissed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${filter === s ? 'text-white' : 'btn-ghost'}`}
              style={filter === s ? { background: 'linear-gradient(135deg,#E63946,#C1121F)' } : {}}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div className="space-y-3">
            {filtered.map((r: any) => (
              <div key={r._id} className="card p-5 anim-fade">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold capitalize"
                        style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946', border: '1px solid rgba(230,57,70,0.2)' }}>
                        {r.targetType}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm font-medium text-fg">{r.reason}</p>
                    {r.target && <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>
                      {r.target.image && <img src={r.target.image} alt="Reported post" className="w-full max-h-48 object-cover rounded-lg mb-2" />}
                      <p className="text-sm text-fg2">{r.target.caption || r.target.description || r.target.name || r.target.restaurantName || 'Reported content'}</p>
                      <p className="text-xs text-fg3 mt-1 font-mono">ID: {r.target._id}</p>
                    </div>}
                    <p className="text-xs text-fg3 mt-1">
                      By: {r.reporter?.name || '—'} · {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => act(() => reportsApi.updateReport(r._id, { status: 'reviewed' }))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => act(() => reportsApi.updateReport(r._id, { status: 'dismissed' }))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    <button onClick={() => { if (confirm(r.targetType === 'post' ? 'Delete this report and the reported post?' : 'Delete this report?')) act(() => reportsApi.deleteReport(r._id)) }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-fg3">
                <p className="text-4xl mb-3">🚩</p>
                <p className="font-medium">{t('noData')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
