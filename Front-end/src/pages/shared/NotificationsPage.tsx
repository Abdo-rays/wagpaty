import { Bell, Check, Trash2, ShoppingBag, Info, MessageSquare } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { notificationsApi } from '../../lib/api/notifications.api'
import { useLang } from '../../context/LanguageContext'

const TYPE_ICONS: Record<string, any> = {
  newOrder: ShoppingBag, orderAccepted: ShoppingBag, orderRejected: ShoppingBag,
  orderCancelled: ShoppingBag, orderOnTheWay: ShoppingBag, orderDelivered: ShoppingBag,
  newMessage: MessageSquare, restaurantApproved: Info, general: Info,
}
const TYPE_COLORS: Record<string, string> = {
  newOrder: 'rgba(230,57,70,0.1)', orderAccepted: 'rgba(16,185,129,0.1)',
  orderRejected: 'rgba(239,68,68,0.1)', orderCancelled: 'rgba(239,68,68,0.1)',
  orderOnTheWay: 'rgba(59,130,246,0.1)', orderDelivered: 'rgba(16,185,129,0.1)',
  newMessage: 'rgba(99,102,241,0.1)', restaurantApproved: 'rgba(16,185,129,0.1)',
  general: 'rgba(100,116,139,0.1)',
}
const ICON_COLORS: Record<string, string> = {
  newOrder: '#E63946', orderAccepted: '#10B981', orderRejected: '#EF4444',
  orderCancelled: '#EF4444', orderOnTheWay: '#3B82F6', orderDelivered: '#10B981',
  newMessage: '#6366F1', restaurantApproved: '#10B981', general: '#64748B',
}

export default function NotificationsPage() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => notificationsApi.getAll())

  const notifs = data || []
  const unread = notifs.filter((n: any) => !n.isRead).length

  const act = async (fn: () => Promise<any>) => { try { await fn(); refetch() } catch {} }

  return (
    <div>
      <TopBar title={t('notifications')} subtitle={`${unread} unread`} />
      <div className="p-6 space-y-4">
        {unread > 0 && (
          <div className="flex justify-end">
            <button onClick={() => act(() => notificationsApi.readAll())}
              className="flex items-center gap-2 text-sm font-medium btn-ghost px-4 py-2">
              <Check size={13} /> Mark all as read
            </button>
          </div>
        )}

        {loading ? <Spinner /> : (
          <div className="space-y-2.5">
            {notifs.map((n: any) => {
              const Icon = TYPE_ICONS[n.type] || Info
              const bg = TYPE_COLORS[n.type] || 'rgba(100,116,139,0.1)'
              const ic = ICON_COLORS[n.type] || '#64748B'
              return (
                <div key={n._id} className="card p-4 flex items-start gap-4 anim-fade transition-all"
                  style={!n.isRead ? { borderLeft: '3px solid #E63946' } : {}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg, color: ic }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-fg`}>{n.title}</p>
                    <p className={`text-sm mt-0.5 ${n.isRead ? 'text-fg2' : 'text-fg'}`}>{n.message}</p>
                    <p className="text-xs text-fg3 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.isRead && (
                      <button onClick={() => act(() => notificationsApi.readOne(n._id))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        <Check size={12} />
                      </button>
                    )}
                    <button onClick={() => act(() => notificationsApi.delete(n._id))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
            {notifs.length === 0 && (
              <div className="text-center py-16 text-fg3">
                <Bell size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">{t('noData')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
