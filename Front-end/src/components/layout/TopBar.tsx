import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { notificationsApi } from '../../lib/api/notifications.api'
import { Link } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import { connectSocket, getSocket } from '../../lib/socket'

interface TopBarProps { title: string; subtitle?: string }

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { user } = useAuth()
  const { toggleSidebar } = useLayout()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!user) return
    const loadNotifications = () => notificationsApi.getAll()
      .then(res => {
        const list = res.data?.data || []
        setRecentNotifications(list.slice(0, 4))
        setUnreadNotifications(res.data?.unreadCount ?? list.filter((item: any) => !item.isRead).length)
      })
      .catch(() => setUnreadNotifications(0))
    loadNotifications()
    const stored = sessionStorage.getItem('auth')
    let token: string | undefined
    try { token = stored ? JSON.parse(stored).token : undefined } catch {}
    const socket = connectSocket(token) || getSocket()
    const onNotification = (notification: any) => {
      setRecentNotifications(prev => [notification, ...prev.filter(item => item._id !== notification._id)].slice(0, 4))
      setUnreadNotifications(count => count + 1)
    }
    socket?.on('newNotification', onNotification)
    return () => socket?.off('newNotification', onNotification)
  }, [user])

  return (
    <header className="topbar px-6 py-4 flex items-center justify-between sticky top-0 z-10"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--card-border)' }}>
      <div className="topbar-leading">
        <button onClick={toggleSidebar} title="Toggle navigation" aria-label="Toggle navigation"
          className="sidebar-toggle w-9 h-9 mr-2 rounded-lg items-center justify-center text-fg2 hover:text-fg"
          style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>
          <Menu size={18} />
        </button>
        <div className="topbar-copy">
          <h1 className="text-xl font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{title}</h1>
          {subtitle && <p className="text-sm text-fg3">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Link to="/home" className="text-sm text-fg3 px-3 py-1 rounded-md hover:bg-transparent/5">الصفحة العامة</Link>
        {user ? (
          <>
            <div className="relative">
            <button onClick={() => setShowNotifications(open => !open)} title="Notifications" aria-label="Notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>
              <Bell size={16} className="text-fg2" />
              {unreadNotifications > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                style={{ background: '#E63946', fontSize: '9px' }}>{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
            </button>
            {showNotifications && <div className="notification-dropdown card p-2">
              <div className="flex items-center justify-between px-2 py-2"><strong className="text-sm text-fg">Latest notifications</strong><Link to={`/${user.role}/notifications`} onClick={() => setShowNotifications(false)} className="text-xs text-red-500">View all</Link></div>
              {recentNotifications.length ? recentNotifications.map(notification => <Link key={notification._id} to={`/${user.role}/notifications`} onClick={() => setShowNotifications(false)} className="block rounded-lg px-2 py-2 hover:bg-alt"><p className="text-xs font-semibold text-fg">{notification.title}</p><p className="text-xs text-fg2 mt-1 break-words">{notification.message}</p></Link>) : <p className="px-2 py-5 text-center text-xs text-fg3">No notifications</p>}
            </div>}
            </div>
            <Link to={`/${user.role}/profile`} title="Profile" aria-label="Profile" className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
              {(user.profileImage || user.logo) ? <img src={user.profileImage || user.logo} alt="" className="w-full h-full object-cover" /> : (user.restaurantName || user.name).charAt(0).toUpperCase()}
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn-primary px-4 py-2 text-sm">تسجيل الدخول</Link>
        )}
      </div>
    </header>
  )
}
