import { useState } from 'react'
import { CheckCircle, XCircle, Truck, Package } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { ordersApi } from '../../lib/api/orders.api'
import { useLang } from '../../context/LanguageContext'

export default function RestaurantOrders() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => ordersApi.getRestaurantOrders())
  const [tab, setTab] = useState('all')

  const orders = data || []
  const tabs = ['all', 'pending', 'accepted', 'onTheWay', 'delivered', 'rejected', 'cancelled']
  const filtered = tab === 'all' ? orders : orders.filter((o: any) => o.status === tab)

  const act = async (fn: () => Promise<any>) => { try { await fn(); refetch() } catch {} }

  return (
    <div>
      <TopBar title={t('orders')} subtitle={`${orders.length} total orders`} />
      <div className="p-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 ${tab === tb ? 'text-white' : 'btn-ghost'}`}
              style={tab === tb ? { background: 'linear-gradient(135deg,#E63946,#C1121F)' } : {}}>
              {t(tb as any) || tb}
              {tb !== 'all' && (
                <span className="ml-1 opacity-60">({orders.filter((o: any) => o.status === tb).length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div className="space-y-3">
            {filtered.map((o: any) => (
              <div key={o._id} className="card p-5 anim-fade">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-fg2">{o.code}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="font-bold text-fg">{o.customer?.name}</p>
                    <p className="text-sm text-fg2">{o.deliveryAddress}</p>
                    <p className="text-xs text-fg3">{o.phone}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 text-sm text-fg2">
                      {o.items?.map((i: any) => <span key={i._id}>{i.name} ×{i.quantity}</span>)}
                    </div>
                    {o.notes && <p className="text-xs text-fg3 mt-1 italic">Note: {o.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-fg" style={{ fontFamily: 'Outfit' }}>EGP {o.totalPrice}</p>
                    <p className="text-xs text-fg3">{o.paymentMethod}</p>
                    <p className="text-xs text-fg3 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {o.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                    <button onClick={() => act(() => ordersApi.accept(o._id))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                      <CheckCircle size={14} /> {t('accept')}
                    </button>
                    <button onClick={() => act(() => ordersApi.reject(o._id))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <XCircle size={14} /> {t('reject')}
                    </button>
                  </div>
                )}
                {o.status === 'accepted' && (
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                    <button onClick={() => act(() => ordersApi.onTheWay(o._id))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
                      <Truck size={14} /> {t('markOnTheWay')}
                    </button>
                  </div>
                )}
                {o.status === 'onTheWay' && (
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                    <button onClick={() => act(() => ordersApi.deliver(o._id))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                      <Package size={14} /> {t('markDelivered')}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-14 text-fg3">
                <p className="text-4xl mb-3">📦</p>
                <p className="font-medium">{t('noData')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
