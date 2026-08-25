import { useState } from 'react'
import { Search, ShoppingCart, X, Plus, Minus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { customersApi } from '../../lib/api/customers.api'
import { mealsApi } from '../../lib/api/meals.api'
import { ordersApi } from '../../lib/api/orders.api'
import { useLang } from '../../context/LanguageContext'
import MealDetailsModal from '../../components/ui/MealDetailsModal'

type CartItem = { mealId: string; name: string; price: number; qty: number; restId: string; restName: string }

export default function CustomerRestaurants() {
  const { t } = useLang()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [detailsMeal, setDetailsMeal] = useState<any | null>(null)

  const { data: restaurants, loading } = useFetch<any[]>(() => customersApi.getRestaurants())
  const { data: mealsData, loading: loadingMeals } = useFetch<any[]>(
    () => selected ? mealsApi.getByRestaurant(selected._id) : Promise.resolve({ data: { data: [] } }),
    [selected?._id]
  )

  const normalizeList = (src: any) => {
    const list = Array.isArray(src) ? src : (src?.restaurants || src?.data || [])
    return (list || []).map((r: any) => ({
      _id: r._id || r.id || r.restaurantId || r.restId,
      restaurantName: r.restaurantName || r.name || r.restaurantName || r.restaurant?.restaurantName,
      category: r.category || r.cuisine,
      address: r.address,
      logo: r.logo || r.image || r.photo || r.avatar,
      rating: r.rating,
      totalOrders: r.totalOrders || r.orders || 0,
      ...r,
    }))
  }

  const list = normalizeList(restaurants)

  const filtered = (list || []).filter((r: any) =>
    (r.restaurantName || '').toLowerCase().includes(search.toLowerCase()))

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const meals = mealsData || []

  const addToCart = (m: any) => {
    const id = m._id || m.id
    const restId = m.restaurant || m.restaurantId || m.restaurant?._id
    const restName = m.restaurantName || m.restaurant?.restaurantName || selected?.restaurantName || ''
    const finalPrice = m.discount?.hasDiscount ? Math.round(m.price * (1 - m.discount.percentage / 100)) : m.price
    if (cart.length && cart[0].restId !== restId) {
      if (!confirm('Clear cart and add from this restaurant?')) return
      setCart([])
    }
    setCart(c => {
      const ex = c.find(i => i.mealId === id)
      if (ex) return c.map(i => i.mealId === id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { mealId: id, name: m.name, price: finalPrice, qty: 1, restId, restName }]
    })
  }

  const updateQty = (mealId: string, delta: number) =>
    setCart(c => c.map(i => i.mealId === mealId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))

  const placeOrder = async () => {
    if (!address.trim() || !phone.trim()) { alert('Please fill address and phone'); return }
    setPlacing(true)
    try {
      const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0)
      const payload = {
        restaurantId: cart[0].restId,
        restaurant: cart[0].restId,
        items: cart.map(i => ({ meal: i.mealId, mealId: i.mealId, quantity: i.qty, price: i.price })),
        deliveryAddress: address,
        phone,
        notes,
        paymentMethod: 'cash',
        totalPrice,
      }
      await ordersApi.create(payload)
      setCart([]); setShowCart(false); setAddress(''); setPhone(''); setNotes('')
      alert('Order placed! 🎉')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  return (
    <div>
      <TopBar title={t('restaurants')} subtitle="Order from the best restaurants near you" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="input-base pl-9" />
          </div>
          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm flex-shrink-0">
              <ShoppingCart size={15} /> {t('cart')}
              <span className="bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            </button>
          )}
        </div>

        {selected ? (
          <div className="anim-fade">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setSelected(null)} className="btn-ghost text-sm px-3 py-1.5">← {t('back')}</button>
              <div>
                <h2 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{selected.restaurantName}</h2>
                <p className="text-sm text-fg3">⭐ {selected.rating?.toFixed(1) || '—'} · {selected.category}</p>
              </div>
            </div>
            {loadingMeals ? <Spinner /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {meals.map((m: any) => {
                  const final = m.discount?.hasDiscount ? Math.round(m.price * (1 - m.discount.percentage / 100)) : m.price
                  const inCart = cart.find(i => i.mealId === m._id)
                  return (
                    <div key={m._id} className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailsMeal(m)}>
                      <div className="relative w-full h-36 bg-alt">
                        {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
                        {m.discount?.hasDiscount && (
                          <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#E63946' }}>-{m.discount.percentage}%</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-fg text-sm" style={{ fontFamily: 'Outfit' }}>{m.name}</h3>
                        <p className="text-xs text-fg3">{m.category}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="font-bold text-fg">EGP {final}</span>
                            {m.discount?.hasDiscount && <span className="text-xs text-fg3 line-through ml-1">EGP {m.price}</span>}
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={event => { event.stopPropagation(); updateQty(m._id, -1) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
                                <Minus size={11} />
                              </button>
                              <span className="font-bold text-fg text-sm w-5 text-center">{inCart.qty}</span>
                              <button onClick={event => { event.stopPropagation(); updateQty(m._id, 1) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#E63946' }}>
                                <Plus size={11} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={event => { event.stopPropagation(); addToCart(m) }} className="btn-primary text-xs px-3 py-1.5" disabled={!m.isAvailable}>
                              {m.isAvailable ? t('addToCart') : t('unavailable')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {meals.length === 0 && <div className="col-span-full py-12 text-center text-fg3">{t('noData')}</div>}
              </div>
            )}
          </div>
        ) : loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((r: any) => (
              <button key={r._id} onClick={() => setSelected(r)}
                className="card overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 text-left anim-fade">
                <div className="w-full h-40 bg-alt">
                  {r.logo && <img src={r.logo} alt={r.restaurantName} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{r.restaurantName}</h3>
                  <p className="text-sm text-fg3">{r.category} · {r.address}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-fg3">
                    <span className="text-amber-500 font-bold">★ {r.rating?.toFixed(1) || '—'}</span>
                    <span>{r.totalOrders || 0} orders</span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-12 text-center text-fg3">{t('noData')}</div>}
          </div>
        )}
      </div>

      {/* Cart drawer */}
      <MealDetailsModal meal={detailsMeal} onClose={() => setDetailsMeal(null)} />
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end anim-fade" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCart(false)}>
          <div className="w-full max-w-sm flex flex-col h-full anim-slide-right" style={{ background: 'var(--card)' }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h2 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{t('cart')} ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg3" style={{ background: 'var(--bg-alt)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.map(i => (
                <div key={i.mealId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-fg">{i.name}</p>
                    <p className="text-xs text-fg3">EGP {i.price} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(i.mealId, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}><Minus size={11} /></button>
                    <span className="font-bold text-fg text-sm w-5 text-center">{i.qty}</span>
                    <button onClick={() => updateQty(i.mealId, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#E63946' }}><Plus size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid var(--card-border)' }}>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder={t('deliveryAddress') + ' *'} className="input-base" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={`${t('phone')} *`} className="input-base" />
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes')} className="input-base" />
              <div className="flex justify-between text-base font-bold py-1">
                <span className="text-fg">{t('total')}</span>
                <span style={{ color: 'var(--primary)' }}>EGP {cartTotal}</span>
              </div>
              <button onClick={placeOrder} disabled={placing} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                {placing ? <span className="spinner" /> : null} {t('placeOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
