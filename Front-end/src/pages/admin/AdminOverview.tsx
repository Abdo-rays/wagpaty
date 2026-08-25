import { TrendingUp, ShoppingBag, Store, Users, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { adminApi } from '../../lib/api/admin.api'
import { useLang } from '../../context/LanguageContext'

const STATUS_COLORS: Record<string, string> = {
  delivered: '#10B981', onTheWay: '#3B82F6', accepted: '#F59E0B',
  pending: '#6366F1', rejected: '#EF4444', cancelled: '#9CA3AF',
}

export default function AdminOverview() {
  const { t } = useLang()
  const { data: overview, loading } = useFetch<any>(() => adminApi.getOverview())

  return (
    <div>
      <TopBar title={t('overview')} subtitle="Welcome back, Admin 👋" />
      <div className="overview-page p-6 space-y-6">
        {loading ? <Spinner text={t('loading')} /> : !overview ? (
          <div className="text-center py-16 text-fg3">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-medium">{t('noData')}</p>
            <p className="text-sm mt-1 text-fg3">Connect the backend to see live data</p>
          </div>
        ) : (
          <>
            <div className="overview-stats grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title={t('totalRevenue')} value={`EGP ${(overview.totalRevenue / 1000).toFixed(1)}k`} icon={TrendingUp} change={overview.revenueGrowth} color="red" />
              <StatCard title={t('totalOrders')} value={overview.totalOrders} icon={ShoppingBag} change={overview.ordersGrowth} color="blue" />
              <StatCard title={t('totalRestaurants')} value={overview.totalRestaurants} icon={Store} subtitle={`${overview.pendingApprovals || 0} ${t('pendingApproval')}`} color="amber" />
              <StatCard title={t('totalCustomers')} value={overview.totalCustomers} icon={Users} color="green" />
            </div>

            {(overview.pendingApprovals || 0) > 0 && (
              <div className="rounded-2xl p-4 flex items-center justify-between anim-fade"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-amber-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-500">{overview.pendingApprovals} restaurant(s) awaiting approval</p>
                </div>
                <a href="/admin/restaurants" className="text-xs font-medium border px-3 py-1.5 rounded-lg transition-colors text-amber-500 border-amber-500/30 hover:bg-amber-500/10">Review →</a>
              </div>
            )}

            <div className="overview-panels grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-5 overview-panel">
                  <h3 className="font-bold text-fg mb-4" style={{ fontFamily: 'Outfit' }}>Monthly Revenue</h3>
                  {overview.monthlyRevenue?.length > 0 ? <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={overview.monthlyRevenue}>
                      <defs>
                        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E63946" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--fg-3)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--fg-3)' }} axisLine={false} tickLine={false} tickFormatter={v => `${Number(v)/1000}k`} />
                      <Tooltip formatter={(v) => [`EGP ${Number(v).toLocaleString()}`, 'Revenue']}
                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12, color: 'var(--fg)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#E63946" strokeWidth={2.5} fill="url(#rg)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer> : <div className="overview-empty">No revenue data yet</div>}
              </div>

              <div className="card p-5 overview-panel">
                  <h3 className="font-bold text-fg mb-4" style={{ fontFamily: 'Outfit' }}>Orders by Status</h3>
                  {overview.ordersByStatus?.length > 0 ? <>
                  <PieChart width={160} height={160}>
                    <Pie data={overview.ordersByStatus} cx={75} cy={75} innerRadius={50} outerRadius={72} dataKey="value" strokeWidth={0}>
                      {overview.ordersByStatus.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color || STATUS_COLORS[entry.name] || '#6366F1'} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="space-y-2 mt-2">
                    {overview.ordersByStatus.map((s: any) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color || STATUS_COLORS[s.name] }} />
                          <span className="text-fg2 capitalize">{s.name}</span>
                        </div>
                        <span className="font-bold text-fg">{s.value}</span>
                      </div>
                    ))}
                  </div></> : <div className="overview-empty">No orders yet</div>}
              </div>
            </div>

            {/* Last 5 registered */}
            <div className="overview-lists">
              <div className="card overview-list">
                  <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <h3 className="font-bold text-fg text-sm" style={{ fontFamily: 'Outfit' }}>{t('lastFiveRestaurants')}</h3>
                    <a href="/admin/restaurants" className="text-xs text-red-500 hover:text-red-400 font-medium">{t('viewAll')} →</a>
                  </div>
                  <div className="overview-list-items">
                  {(overview.lastRestaurants || []).map((r: any) => (
                    <div key={r._id} className="flex items-center gap-3 px-5 py-3 table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
                        {r.logo ? <img src={r.logo} alt="" className="w-full h-full object-cover" /> : r.restaurantName?.charAt(0) || 'R'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-fg text-sm break-words">{r.restaurantName}</p>
                        <p className="text-xs text-fg3 font-mono">{r.code}</p>
                      </div>
                      <StatusBadge status={r.isApproved ? (r.isActive ? 'active' : 'inactive') : 'pending'} />
                    </div>
                  ))}
                  </div>
                  {(overview.lastRestaurants || []).length === 0 && <div className="overview-list-empty">No restaurants registered yet</div>}
              </div>

              <div className="card overview-list">
                  <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <h3 className="font-bold text-fg text-sm" style={{ fontFamily: 'Outfit' }}>{t('lastFiveCustomers')}</h3>
                    <a href="/admin/customers" className="text-xs text-red-500 hover:text-red-400 font-medium">{t('viewAll')} →</a>
                  </div>
                  <div className="overview-list-items">
                  {(overview.lastCustomers || []).map((c: any) => (
                    <div key={c._id} className="flex items-center gap-3 px-5 py-3 table-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                        {c.profileImage ? <img src={c.profileImage} alt="" className="w-full h-full object-cover" /> : c.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-fg text-sm break-words">{c.name}</p>
                        <p className="text-xs text-fg3 font-mono">{c.code}</p>
                      </div>
                      <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
                    </div>
                  ))}
                  </div>
                  {(overview.lastCustomers || []).length === 0 && <div className="overview-list-empty">No customers registered yet</div>}
              </div>
            </div>

            {/* Recent orders */}
            {overview.recentOrders?.length > 0 && (
              <div className="card">
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <h3 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>Recent Orders</h3>
                  <a href="/admin/orders" className="text-sm text-red-500 hover:text-red-400 font-medium">{t('viewAll')} →</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                        {['Order', 'Customer', 'Restaurant', 'Total', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-fg3 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recentOrders.map((o: any) => (
                        <tr key={o._id} className="table-row overview-order-row" style={{ borderBottom: '1px solid var(--card-border)' }}>
                          <td className="px-5 py-3.5 font-mono text-xs font-bold text-fg2">{o.code}</td>
                          <td className="px-5 py-3.5 text-fg">{o.customer?.name || '—'}</td>
                          <td className="px-5 py-3.5 text-fg2">{o.restaurant?.restaurantName || '—'}</td>
                          <td className="px-5 py-3.5 font-bold text-fg">EGP {o.totalPrice}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                          <td className="px-5 py-3.5 text-fg3 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
