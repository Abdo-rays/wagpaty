import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, MessageSquare,
  Bell, LogOut, Users, Store, ChefHat, ClipboardList,
  TrendingUp, Settings, Users2, Flag, Sun, Moon, Globe,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationsApi } from '../../lib/api/notifications.api'
import { chatApi } from '../../lib/api/chat.api'
import { useLayout } from './LayoutContext'

interface NavItem { label: string; to: string; icon: typeof LayoutDashboard }

const navByRole = (t: (k: any) => string): Record<UserRole, NavItem[]> => ({
  admin: [
    { label: t('overview'),     to: '/admin',               icon: LayoutDashboard },
    { label: t('restaurants'),  to: '/admin/restaurants',   icon: Store },
    { label: t('customers'),    to: '/admin/customers',     icon: Users },
    { label: t('meals'),        to: '/admin/meals',         icon: UtensilsCrossed },
    { label: t('orders'),       to: '/admin/orders',        icon: ClipboardList },
    { label: t('reports'),      to: '/admin/reports',       icon: Flag },
    { label: t('community'),    to: '/admin/community',     icon: Users2 },
  ],
  restaurant: [
    { label: t('dashboard'),    to: '/restaurant',          icon: LayoutDashboard },
    { label: t('myMeals'),      to: '/restaurant/meals',    icon: ChefHat },
    { label: t('orders'),       to: '/restaurant/orders',   icon: ShoppingBag },
    { label: t('analytics'),    to: '/restaurant/analytics',icon: TrendingUp },
    { label: t('chat'),         to: '/restaurant/chat',     icon: MessageSquare },
    { label: t('community'),    to: '/restaurant/community',icon: Users2 },
    { label: t('profile'),      to: '/restaurant/profile',  icon: Settings },
  ],
  customer: [
    { label: t('dashboard'),    to: '/customer',            icon: LayoutDashboard },
    { label: t('restaurants'),  to: '/customer/restaurants',icon: Store },
    { label: t('myOrders'),     to: '/customer/orders',     icon: ShoppingBag },
    { label: t('chat'),         to: '/customer/chat',       icon: MessageSquare },
    { label: t('community'),    to: '/customer/community',  icon: Users2 },
    { label: t('reviews'),      to: '/customer/reviews',    icon: TrendingUp },
    { label: t('profile'),      to: '/customer/profile',    icon: Settings },
  ],
})

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { toggleTheme, isDark } = useTheme()
  const { t, toggleLang, lang } = useLang()
  const navigate = useNavigate()
  const { sidebarOpen, closeSidebar } = useLayout()
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMsgs, setUnreadMsgs] = useState(0)

  useEffect(() => {
    if (!user) return
    const refreshCounts = () => {
      notificationsApi.getAll({ unreadOnly: true }).then(r => {
        setUnreadNotifs(r.data?.unreadCount ?? r.data?.data?.length ?? 0)
      }).catch(() => {})
      chatApi.getUnreadCount().then(r => {
        setUnreadMsgs(r.data?.unreadCount || 0)
      }).catch(() => {})
    }
    refreshCounts()
    const interval = window.setInterval(refreshCounts, 15000)
    return () => window.clearInterval(interval)
  }, [user])

  if (!user) return null
  const items = navByRole(t)[user.role]
  const displayName = user.role === 'restaurant' ? (user.restaurantName || user.name) : user.name

  return (
    <aside className={`sidebar w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto ${sidebarOpen ? 'is-open' : ''}`} style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Brand */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            <UtensilsCrossed size={15} className="text-white" />
          </div>
          <span className="text-white font-bold" style={{ fontFamily: 'Outfit', fontSize: '1.05rem' }}>Wagpaty</span>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            {(user.profileImage || user.logo) ? <img src={user.profileImage || user.logo} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{displayName}</p>
            <p className="text-slate-500 text-xs truncate font-mono">{user.code}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={closeSidebar}
            title={item.label}
            aria-label={item.label}
            end={['/admin', '/restaurant', '/customer'].includes(item.to)}
            className={({ isActive }) =>
              `sidebar-item flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${isActive ? 'active' : ''}`
            }>
            {({ isActive }) => (
              <>
                <item.icon size={15} className={isActive ? 'text-white' : ''} />
                <span>{item.label}</span>
                {item.to.includes('chat') && unreadMsgs > 0 && (
                  <span className="ml-auto text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: '#E63946', color: '#fff', fontSize: '10px' }}>{unreadMsgs}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Notifications */}
        <NavLink to={`/${user.role}/notifications`} onClick={closeSidebar}
          title={t('notifications')}
          aria-label={t('notifications')}
          className={({ isActive }) => `sidebar-item flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'active' : ''}`}>
          <Bell size={15} />
          <span>{t('notifications')}</span>
          {unreadNotifs > 0 && (
            <span className="ml-auto text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
              style={{ background: '#E63946', color: '#fff', fontSize: '10px' }}>{unreadNotifs}</span>
          )}
        </NavLink>
      </nav>

      {/* Controls */}
      <div className="px-2.5 py-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1">
          <button title={isDark ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}
            aria-label={isDark ? 'Light mode' : 'Dark mode'}
            className="sidebar-item flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-medium">
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button title={lang === 'ar' ? 'English' : 'العربية'} onClick={toggleLang}
            aria-label={lang === 'ar' ? 'English' : 'العربية'}
            className="sidebar-item flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-medium">
            <Globe size={13} />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
        <button title={t('logout')} aria-label={t('logout')} onClick={() => { logout(); navigate('/login') }}
          className="sidebar-item w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium hover:text-red-400 transition-colors">
          <LogOut size={14} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  )
}
