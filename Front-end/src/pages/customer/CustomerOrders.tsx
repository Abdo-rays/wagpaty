import { useState } from 'react'
import { X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { ordersApi } from '../../lib/api/orders.api'
import { useLang } from '../../context/LanguageContext'

export default function CustomerOrders() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => ordersApi.getMyOrders())
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)

  const orders = Array.isArray(data) ? data : (data as any)?.orders || []
  const tabs = ['all', 'pending', 'accepted', 'onTheWay', 'delivered', 'cancelled', 'rejected']
  const filtered = tab === 'all' ? orders : orders.filter((o: any) => o.status === tab)

  const cancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    try { await ordersApi.cancel(id); refetch() } catch {}
  }

  return (
    <div>
      <TopBar title={t('myOrders')} subtitle={`${orders.length} total orders`} />
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
              <div key={o._id} className="card p-5 hover:shadow-md transition-shadow anim-fade cursor-pointer" onClick={() => setSelected(o)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-fg2">{o.code}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="font-bold text-fg">{o.restaurant?.restaurantName}</p>
                    <p className="text-sm text-fg2">{o.deliveryAddress}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 text-sm text-fg2">
                      {o.items?.slice(0, 3).map((i: any) => <span key={i._id}>{i.name} x{i.quantity}</span>)}
                      {o.items?.length > 3 && <span className="text-fg3">+{o.items.length - 3} more</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-fg" style={{ fontFamily: 'Outfit' }}>EGP {o.totalPrice}</p>
                    <p className="text-xs text-fg3 mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {['pending', 'accepted', 'onTheWay'].includes(o.status) && (
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                    <div className="flex items-center gap-0 mb-2">
                      {['Placed', 'Accepted', 'On the Way', 'Delivered'].map((step, idx) => {
                        const stepKeys = ['pending', 'accepted', 'onTheWay', 'delivered']
                        const done = stepKeys.indexOf(o.status) >= idx
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-2.5 h-2.5 rounded-full transition-colors" style={{ background: done ? '#E63946' : 'var(--card-border)' }} />
                              <span className="text-xs whitespace-nowrap" style={{ color: done ? '#E63946' : 'var(--fg-3)', fontSize: 10 }}>{step}</span>
                            </div>
                            {idx < 3 && <div className="flex-1 h-0.5 mb-3 mx-0.5" style={{ background: done ? '#E63946' : 'var(--card-border)' }} />}
                          </div>
                        )
                      })}
                    </div>
                    {o.status === 'pending' && (
                      <button onClick={e => { e.stopPropagation(); cancel(o._id) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <X size={12} /> {t('cancel')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-14 text-fg3">
                <p className="text-4xl mb-3">🛍️</p>
                <p className="font-medium">{t('noData')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay anim-fade" onClick={() => setSelected(null)}>
          <div className="card p-6 w-full max-w-lg anim-scale overflow-y-auto" style={{ maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-fg text-lg" style={{ fontFamily: 'Outfit' }}>Order Details</h2>
                <span className="font-mono text-sm text-fg3">{selected.code}</span>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg3" style={{ background: 'var(--bg-alt)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg3">Status</span>
                <StatusBadge status={selected.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg3">Restaurant</span>
                <span className="text-sm font-semibold text-fg">{selected.restaurant?.restaurantName}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-fg3 flex-shrink-0">{t('deliveryAddress')}</span>
                <span className="text-sm text-fg2 text-right">{selected.deliveryAddress}</span>
              </div>
              {selected.notes && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg3">{t('notes')}</span>
                  <span className="text-sm text-fg2 italic">{selected.notes}</span>
                </div>
              )}
              <div className="pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <p className="text-xs font-semibold text-fg3 uppercase tracking-wider mb-3">Items</p>
                {selected.items?.map((i: any) => (
                  <div key={i._id} className="flex justify-between py-2 text-sm">
                    <span className="text-fg">{i.name} <span className="text-fg3">x{i.quantity}</span></span>
                    <span className="font-medium text-fg">EGP {i.price * i.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-2 font-bold text-base" style={{ borderTop: '1px solid var(--card-border)' }}>
                <span className="text-fg">{t('total')}</span>
                <span style={{ color: 'var(--primary)' }}>EGP {selected.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
