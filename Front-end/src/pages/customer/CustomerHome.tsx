import { ShoppingBag, Store, Star } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { customersApi } from '../../lib/api/customers.api'
import { ordersApi } from '../../lib/api/orders.api'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'

export default function CustomerHome() {
  const { user } = useAuth()
  const { t } = useLang()
  const { data: overview, loading: loadingOv } = useFetch<any>(() => customersApi.getOverview())
  const { data: ordersData } = useFetch<any>(() => ordersApi.getMyOrders({ limit: 5 }))
  const { data: restaurants } = useFetch<any[]>(() => customersApi.getRestaurants({ limit: 3 }))

  const normalizeList = (src: any) => {
    const list = Array.isArray(src) ? src : (src?.restaurants || src?.data || [])
    return (list || []).map((r: any) => ({
      _id: r._id || r.id || r.restaurantId || r.restId,
      restaurantName: r.restaurantName || r.name || r.restaurant?.restaurantName,
      category: r.category || r.cuisine,
      logo: r.logo || r.image || r.photo || r.avatar,
      rating: r.rating,
      totalOrders: r.totalOrders || r.orders || 0,
      ...r,
    }))
  }

  const normalizedRestaurants = normalizeList(restaurants)

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || []
  const activeOrder = orders.find((o: any) => ['pending', 'accepted', 'onTheWay'].includes(o.status))

  return (
    <div>
      <TopBar title={t('dashboard')} subtitle={`${t('welcomeBack')}, ${user?.name} 👋`} />
      <div className="overview-page p-6 space-y-6">
        {loadingOv ? <Spinner /> : (
          <div className="overview-stats customer-overview-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title={t('totalOrders')} value={overview?.totalOrders || 0} icon={ShoppingBag} color="blue" />
            <StatCard title="Total Spent" value={`EGP ${((overview?.totalSpent || 0) / 1000).toFixed(1)}k`} icon={Star} color="amber" />
            <StatCard title={t('restaurants')} value={overview?.availableRestaurants || 0} icon={Store} color="green" />
          </div>
        )}

        {activeOrder && (
          <div className="rounded-2xl p-5 text-white anim-fade"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-1">Active Order</p>
                <h3 className="font-bold text-xl" style={{ fontFamily: 'Outfit' }}>{activeOrder.restaurant?.restaurantName}</h3>
                <p className="text-red-200 text-sm mt-1 font-mono">{activeOrder.code}</p>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>
            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex flex-wrap gap-x-3 text-sm text-red-100">
                {activeOrder.items?.slice(0, 3).map((i: any) => <span key={i._id}>{i.name} ×{i.quantity}</span>)}
              </div>
              <Link to="/customer/orders" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                Track →
              </Link>
            </div>
          </div>
        )}

        {(normalizedRestaurants?.length || 0) > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-fg text-base" style={{ fontFamily: 'Outfit' }}>Popular Restaurants</h2>
              <Link to="/customer/restaurants" className="text-xs text-red-500 font-medium">{t('viewAll')} →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(normalizedRestaurants || []).map((r: any) => (
                <Link key={r._id} to="/customer/restaurants"
                  className="card overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 anim-fade">
                  <div className="w-full h-32 bg-alt">
                    {r.logo && <img src={r.logo} alt={r.restaurantName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-fg text-sm" style={{ fontFamily: 'Outfit' }}>{r.restaurantName}</h3>
                    <p className="text-xs text-fg3">{r.category}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="text-amber-500 font-bold">★ {r.rating?.toFixed(1) || '—'}</span>
                      <span className="text-fg3">{r.totalOrders || 0} orders</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-fg text-base" style={{ fontFamily: 'Outfit' }}>Recent Orders</h2>
              <Link to="/customer/orders" className="text-xs text-red-500 font-medium">{t('viewAll')} →</Link>
            </div>
            <div className="card overflow-hidden">
              {orders.slice(0, 4).map((o: any) => (
                <div key={o._id} className="customer-order-row flex items-center justify-between gap-3 px-5 py-3.5 table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg text-sm">{o.restaurant?.restaurantName}</p>
                    <p className="text-xs text-fg3 font-mono">{o.code}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={o.status} />
                    <p className="text-xs text-fg3 mt-1">EGP {o.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
