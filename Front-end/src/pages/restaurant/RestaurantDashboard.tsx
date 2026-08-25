import { TrendingUp, ShoppingBag, Star, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { restaurantsApi } from '../../lib/api/restaurants.api'
import { ordersApi } from '../../lib/api/orders.api'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

export default function RestaurantDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const { data: overview, loading } = useFetch<any>(() => restaurantsApi.getOverview())
  const { data: orders } = useFetch<any[]>(() => ordersApi.getRestaurantOrders({ limit: 5 }))

  return (
    <div>
      <TopBar title={t('dashboard')} subtitle={`Good morning, ${user?.restaurantName || user?.name} 🍔`} />
      <div className="overview-page p-6 space-y-6">
        {loading ? <Spinner /> : (
          <>
            <div className="overview-stats grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title={t('totalRevenue')} value={`EGP ${((overview?.totalRevenue || 0) / 1000).toFixed(1)}k`} icon={DollarSign} change={overview?.revenueGrowth} color="red" />
              <StatCard title={t('totalOrders')} value={overview?.totalOrders || 0} icon={ShoppingBag} change={overview?.ordersGrowth} color="blue" />
              <StatCard title="Avg Rating" value={`${(overview?.rating || 0).toFixed(1)} ★`} icon={Star} color="amber" />
              <StatCard title="This Month" value={`EGP ${((overview?.monthRevenue || 0) / 1000).toFixed(1)}k`} icon={TrendingUp} change={overview?.monthGrowth} color="green" />
            </div>

            {overview?.weeklyOrders?.length > 0 && (
              <div className="card p-5 overview-panel">
                <h3 className="font-bold text-fg mb-4" style={{ fontFamily: 'Outfit' }}>Orders This Week</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={overview.weeklyOrders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--fg-3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--fg-3)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12, color: 'var(--fg)' }} />
                    <Bar dataKey="orders" fill="#E63946" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="card">
          <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h3 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>Recent Orders</h3>
            <a href="/restaurant/orders" className="text-xs text-red-500 font-medium">{t('viewAll')} →</a>
          </div>
          {!orders ? <Spinner /> : orders.length === 0 ? (
            <div className="py-10 text-center text-fg3 text-sm">{t('noData')}</div>
          ) : orders.slice(0, 5).map((o: any) => (
            <div key={o._id} className="restaurant-order-row flex items-center justify-between px-5 py-3.5 table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <div className="min-w-0">
                <p className="font-semibold text-fg text-sm">{o.customer?.name}</p>
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
    </div>
  )
}
