import { useState } from 'react'
import { Trash2, Flag, Check, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { communityApi } from '../../lib/api/community.api'
import { reportsApi } from '../../lib/api/reports.api'
import { useLang } from '../../context/LanguageContext'

export default function AdminCommunity() {
  const { t } = useLang()
  const { data: posts, loading, refetch } = useFetch<any[]>(() => communityApi.getPosts())
  const { data: reports, refetch: refetchReports } = useFetch<any[]>(() => reportsApi.getAdminReports({ targetType: 'post' }))

  const [tab, setTab] = useState<'posts' | 'reports'>('posts')

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try { await communityApi.deletePost(id); refetch() } catch {}
  }

  const handleReport = async (id: string, status: 'reviewed' | 'dismissed') => {
    try { await reportsApi.updateReport(id, { status }); refetchReports() } catch {}
  }

  const postList = posts || []
  const reportList = Array.isArray(reports) ? reports : (reports as any)?.reports || []

  return (
    <div>
      <TopBar title="Community" subtitle="Manage posts and reports" />
      <div className="p-6 space-y-5">
        <div className="flex gap-2">
          {(['posts', 'reports'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === tb ? 'text-white' : 'btn-ghost'}`}
              style={tab === tb ? { background: 'linear-gradient(135deg,#E63946,#C1121F)' } : {}}>
              {tb === 'posts' ? 'Posts' : 'Reports'}
              {tb === 'reports' && reportList.filter((r: any) => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {reportList.filter((r: any) => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'posts' ? (
          loading ? <Spinner /> : (
            <div className="space-y-3">
              {postList.map((p: any) => (
                <div key={p._id} className="card p-5 anim-fade">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-fg">{p.author?.name}</span>
                        <span className="text-xs text-fg3">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-fg2 break-words">{p.content}</p>
                      {p.image && <img src={p.image} alt="" className="mt-2 rounded-lg max-h-32 object-cover" />}
                      <div className="flex items-center gap-4 mt-3 text-xs text-fg3">
                        <span>❤️ {p.likesCount || 0} likes</span>
                        <span>💬 {p.commentsCount || 0} comments</span>
                      </div>
                    </div>
                    <button onClick={() => deletePost(p._id)} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {postList.length === 0 && <div className="text-center py-12 text-fg3">{t('noData')}</div>}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {reportList.map((r: any) => (
              <div key={r._id} className="card p-5 anim-fade">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Flag size={13} className="text-red-400" />
                      <span className="font-semibold text-sm text-fg">{r.reporter?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'badge-warning' : r.status === 'reviewed' ? 'badge-success' : 'badge-gray'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-fg2">Reason: {r.reason}</p>
                    <p className="text-xs text-fg3 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleReport(r._id, 'reviewed' as const)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => handleReport(r._id, 'dismissed' as const)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(100,116,139,0.1)', color: '#64748B' }}>
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reportList.length === 0 && <div className="text-center py-12 text-fg3">{t('noData')}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
