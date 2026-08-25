import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { adminApi } from '../../lib/api/admin.api'
import { useLang } from '../../context/LanguageContext'
import MealDetailsModal from '../../components/ui/MealDetailsModal'

export default function AdminMeals() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => adminApi.getMeals())
  const [search, setSearch] = useState('')
  const [restFilter, setRestFilter] = useState('all')
  const [detailsMeal, setDetailsMeal] = useState<any | null>(null)

  const allMeals = data || []
  const restaurants = [...new Set(allMeals.map((m: any) => m.restaurant?.restaurantName).filter(Boolean))]
  const filtered = allMeals.filter((m: any) =>
    (restFilter === 'all' || m.restaurant?.restaurantName === restFilter) &&
    m.name?.toLowerCase().includes(search.toLowerCase())
  )

  const del = async (id: string) => {
    if (!confirm('Delete this meal?')) return
    try { await adminApi.deleteMeal(id); refetch() } catch {}
  }

  return (
    <div>
      <TopBar title={t('meals')} subtitle={`${allMeals.length} meals across all restaurants`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="input-base pl-9" />
          </div>
          <select value={restFilter} onChange={e => setRestFilter(e.target.value)} className="input-base" style={{ width: 'auto', paddingRight: '2rem' }}>
            <option value="all">All Restaurants</option>
            {restaurants.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((m: any) => {
              const finalPrice = m.discount?.hasDiscount
                ? Math.round(m.price * (1 - m.discount.percentage / 100))
                : m.price
              return (
                <div key={m._id} className="card overflow-hidden hover:shadow-md transition-shadow anim-fade cursor-pointer" onClick={() => setDetailsMeal(m)}>
                  <div className="relative">
                    <div className="w-full h-36 bg-alt">
                      {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
                    </div>
                    {m.discount?.hasDiscount && (
                      <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#E63946' }}>-{m.discount.percentage}%</span>
                    )}
                    <button onClick={event => { event.stopPropagation(); del(m._id) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-fg text-sm" style={{ fontFamily: 'Outfit' }}>{m.name}</h3>
                    <p className="text-xs text-fg3">{m.restaurant?.restaurantName} · {m.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-fg text-sm">EGP {finalPrice}</span>
                      {m.discount?.hasDiscount && <span className="text-xs text-fg3 line-through">EGP {m.price}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && <div className="col-span-full py-12 text-center text-fg3">{t('noData')}</div>}
          </div>
        )}
      </div>
      <MealDetailsModal meal={detailsMeal} onClose={() => setDetailsMeal(null)} />
    </div>
  )
}
