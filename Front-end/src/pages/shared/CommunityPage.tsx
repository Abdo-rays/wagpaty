import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Trash2, Flag, Plus, X, Send } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { communityApi } from '../../lib/api/community.api'
import { reportsApi } from '../../lib/api/reports.api'
import { uploadApi } from '../../lib/api/upload.api'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

export default function CommunityPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const { data, loading, error, refetch } = useFetch<any[]>(() => communityApi.getPosts())
  const [postsState, setPostsState] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [reportId, setReportId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => { if (data) setPostsState(data) }, [data])
  const posts = postsState

  const createPost = async () => {
    if (!caption.trim() && !imageFile && !image.trim()) return
    setCreating(true)
    try {
      let imageUrl = image.trim()
      if (imageFile) {
        setUploadingImage(true)
        const uploaded = await uploadApi.image(imageFile, 'posts')
        imageUrl = uploaded.data.data
        setUploadingImage(false)
      }
      await communityApi.createPost({ caption, image: imageUrl || undefined })
      setCaption(''); setImage(''); setImageFile(null); setShowCreate(false); refetch()
    } catch {} finally { setCreating(false) }
  }

  const likePost = async (id: string) => {
    const current = posts.find((post: any) => post._id === id)
    if (!current) return
    const wasLiked = Boolean(current.isLikedByMe)
    setPostsState(prev => prev.map((post: any) => post._id === id ? {
      ...post,
      isLikedByMe: !wasLiked,
      likesCount: Math.max(0, (post.likesCount || 0) + (wasLiked ? -1 : 1)),
    } : post))
    try {
      await communityApi.likePost(id)
    } catch {
      setPostsState(prev => prev.map((post: any) => post._id === id ? {
        ...post,
        isLikedByMe: wasLiked,
        likesCount: Math.max(0, (post.likesCount || 0) + (wasLiked ? 1 : -1)),
      } : post))
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try { await communityApi.deletePost(id); refetch() } catch {}
  }

  const loadComments = async (id: string) => {
    if (expandedComments === id) { setExpandedComments(null); return }
    setExpandedComments(id)
    try {
      const res = await communityApi.getComments(id)
      setCommentsData(c => ({ ...c, [id]: res.data?.data || [] }))
    } catch {}
  }

  const addComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    try {
      await communityApi.addComment(postId, { content })
      setCommentInputs(c => ({ ...c, [postId]: '' }))
      const res = await communityApi.getComments(postId)
      setCommentsData(c => ({ ...c, [postId]: res.data?.data || [] }))
      refetch()
    } catch {}
  }

  const submitReport = async () => {
    const reason = reportReason.trim()
    if (!reportId || reason.length < 5) {
      setReportError('اكتب سبب البلاغ في 5 حروف على الأقل')
      return
    }
    setReporting(true)
    setReportError('')
    try {
      await reportsApi.create({ targetType: 'post', targetId: reportId, reason })
      setReportId(null); setReportReason('')
    } catch (err: any) {
      setReportError(err.response?.data?.message || 'تعذر إرسال البلاغ، حاول مرة أخرى')
    } finally { setReporting(false) }
  }

  return (
    <div>
      <TopBar title={t('community')} subtitle="Share your food experiences" />
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Create post */}
        <button onClick={() => setShowCreate(true)}
          className="w-full card p-4 flex items-center gap-3 text-fg3 hover:text-fg2 transition-colors text-sm">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            {(user?.restaurantName || user?.name || '?').charAt(0)}
          </div>
          <span className="flex-1 text-left px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>
            {t('writeCaption')}
          </span>
          <Plus size={18} style={{ color: 'var(--primary)' }} />
        </button>

        {loading ? <Spinner /> : error ? <div className="text-center py-16 text-red-400"><p>{error}</p><button onClick={refetch} className="btn-primary mt-4 px-4 py-2 text-sm">Retry</button></div> : posts.map((post: any) => {
          const isOwner = post.author?._id === user?.id || post.author === user?.id
          return (
            <div key={post._id} className="card overflow-hidden anim-fade">
              {/* Post header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                    {(post.author?.name || post.author?.restaurantName || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-fg text-sm">{post.author?.name || post.author?.restaurantName}</p>
                    <p className="text-xs text-fg3">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isOwner && (
                    <button onClick={() => setReportId(post._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-fg3 hover:text-amber-500"
                      style={{ background: 'var(--bg-alt)' }}>
                      <Flag size={13} />
                    </button>
                  )}
                  {(isOwner || user?.role === 'admin') && (
                    <button onClick={() => deletePost(post._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Image */}
              {post.image && (
                <div className="w-full" style={{ background: 'var(--bg-alt)', maxHeight: 400, overflow: 'hidden' }}>
                  <img src={post.image} alt="Post" className="w-full object-cover" style={{ maxHeight: 400 }} />
                </div>
              )}

              {/* Caption */}
              {post.caption && (
                <p className="px-4 py-3 text-sm text-fg leading-relaxed">{post.caption}</p>
              )}

              {/* Actions */}
              <div className="px-4 pb-3 flex items-center gap-4">
                <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 text-sm transition-colors text-fg3 hover:text-red-500">
                  <Heart size={16} /> <span>{post.likesCount || 0}</span>
                </button>
                <button onClick={() => loadComments(post._id)} className="flex items-center gap-1.5 text-sm transition-colors text-fg3 hover:text-blue-500">
                  <MessageCircle size={16} /> <span>{post.commentsCount || 0}</span>
                </button>
              </div>

              {/* Comments */}
              {expandedComments === post._id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
                  {(commentsData[post._id] || []).map((c: any) => (
                    <div key={c._id} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                        {(c.author?.name || c.author?.restaurantName || '?').charAt(0)}
                      </div>
                      <div className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-alt)' }}>
                        <p className="font-semibold text-fg text-xs mb-0.5">{c.author?.name || c.author?.restaurantName}</p>
                        <p className="text-fg2">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <input value={commentInputs[post._id] || ''}
                      onChange={e => setCommentInputs(ci => ({ ...ci, [post._id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addComment(post._id)}
                      placeholder={t('addComment')} className="input-base flex-1 py-2 text-sm" />
                    <button onClick={() => addComment(post._id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 text-fg3">
            <p className="text-5xl mb-3">📸</p>
            <p className="font-medium">{t('noData')}</p>
          </div>
        )}
      </div>

      {/* Create post modal */}
      {showCreate && (
        <div className="modal-overlay anim-fade" onClick={() => setShowCreate(false)}>
          <div className="card p-6 w-full max-w-md anim-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{t('newPost')}</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg3 hover:text-fg" style={{ background: 'var(--bg-alt)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="space-y-3">
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder={t('writeCaption')} rows={3}
                className="input-base resize-none" />
              <input type="file" accept="image/*" className="input-base" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setImageFile(f)
                const url = URL.createObjectURL(f)
                setImage(url)
              }} />
              {image && <img src={image} alt="Preview" className="w-full h-40 object-cover rounded-xl" onError={() => setImage('')} />}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 py-2.5 text-sm">{t('cancel')}</button>
              <button onClick={createPost} disabled={creating || (!caption.trim() && !image.trim())} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {creating ? <span className="spinner" /> : null} Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportId && (
        <div className="modal-overlay anim-fade" onClick={() => { setReportId(null); setReportError('') }}>
          <div className="card p-6 w-full max-w-sm anim-scale" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-fg mb-4" style={{ fontFamily: 'Outfit' }}>{t('report')}</h2>
              <textarea value={reportReason} onChange={e => { setReportReason(e.target.value); setReportError('') }}
              placeholder={t('reportReason')} rows={3} className="input-base resize-none mb-4" />
            {reportError && <p className="text-red-400 text-xs mb-3">{reportError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setReportId(null); setReportError('') }} className="btn-ghost flex-1 py-2.5 text-sm">{t('cancel')}</button>
              <button onClick={submitReport} disabled={reporting || reportReason.trim().length < 5} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {reporting ? <span className="spinner" /> : null} {t('submitReport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
