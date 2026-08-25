import { useState } from 'react'
import { Search, Trash2, Eye } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { adminApi } from '../../lib/api/admin.api'
import { useLang } from '../../context/LanguageContext'

export default function AdminOrders() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => adminApi.getOrders())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)

  const filtered = (data || []).filter((o: any) =>
    (statusFilter === 'all' || o.status === statusFilter) &&
    (o.code?.toLowerCase().includes(search.toLowerCase()) ||
     o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
     o.restaurant?.restaurantName?.toLowerCase().includes(search.toLowerCase()))
  )

  const del = async (id: string) => {
    if (!confirm('Delete this order?')) return
    try { await adminApi.deleteOrder(id); refetch(); setSelected(null) } catch {}
  }

  return (
    <div>
      <TopBar title={t('orders')} subtitle={`${(data || []).length} total orders`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="input-base pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-base" style={{ width: 'auto' }}>
            <option value="all">All Status</option>
            {['pending','accepted','onTheWay','delivered','rejected','cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? <Spinner /> : (
          <div className="card overflow-hidden">
            <div className="responsive-table"><table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Order', 'Customer', 'Restaurant', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-fg3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o: any) => (
                  <tr key={o._id} className="table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-fg2">{o.code}</td>
                    <td className="px-5 py-4 text-fg">{o.customer?.name || '—'}</td>
                    <td className="px-5 py-4 text-fg2">{o.restaurant?.restaurantName || '—'}</td>
                    <td className="px-5 py-4 text-fg3">{o.items?.length || 0}</td>
                    <td className="px-5 py-4 font-bold text-fg">EGP {o.totalPrice}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-4 text-fg3 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelected(o)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => del(o._id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
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

      {selected && (
        <div className="modal-overlay anim-fade" onClick={() => setSelected(null)}>
          <div className="card p-6 w-full max-w-md anim-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-fg text-lg" style={{ fontFamily: 'Outfit' }}>{selected.code}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-fg3">Customer</span><span className="font-medium text-fg">{selected.customer?.name}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Restaurant</span><span className="font-medium text-fg">{selected.restaurant?.restaurantName}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Address</span><span className="font-medium text-fg text-right max-w-xs">{selected.deliveryAddress}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Phone</span><span className="font-medium text-fg">{selected.phone}</span></div>
              <hr style={{ borderColor: 'var(--card-border)' }} />
              {selected.items?.map((item: any) => (
                <div key={item._id || item.meal} className="flex justify-between">
                  <span className="text-fg2">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-fg">EGP {item.subtotal}</span>
                </div>
              ))}
              <hr style={{ borderColor: 'var(--card-border)' }} />
              <div className="flex justify-between text-base font-bold">
                <span className="text-fg">Total</span>
                <span style={{ color: '#E63946' }}>EGP {selected.totalPrice}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setSelected(null)} className="btn-ghost flex-1 py-2.5 text-sm">Close</button>
              <button onClick={() => del(selected._id)} className="btn-primary flex-1 py-2.5 text-sm">Delete Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
