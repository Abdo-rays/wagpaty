import { useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { reviewsApi } from '../../lib/api/reviews.api'
import { ordersApi } from '../../lib/api/orders.api'
import { useLang } from '../../context/LanguageContext'

function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange?.(s)} disabled={!onChange}
          className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}>
          <Star size={size} fill={s <= value ? '#F59E0B' : 'none'} stroke={s <= value ? '#F59E0B' : 'var(--fg-3)'} />
        </button>
      ))}
    </div>
  )
}

export default function CustomerReviews() {
  const { t } = useLang()
  const { data: myReviews, loading, refetch } = useFetch<any[]>(() => reviewsApi.getMyReviews())
  const { data: myOrders } = useFetch<any[]>(() => ordersApi.getMyOrders({ status: 'delivered' }))
  const [showForm, setShowForm] = useState<any | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const deliveredOrders = (myOrders || []).filter((o: any) => o.status === 'delivered')

  const submitReview = async () => {
    if (!showForm) return
    setSubmitting(true)
    try {
      await reviewsApi.create(showForm._id, { rating, comment })
      setShowForm(null); setRating(5); setComment('')
      refetch()
    } catch {} finally { setSubmitting(false) }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return
    try { await reviewsApi.deleteMyReview(id); refetch() } catch {}
  }

  return (
    <div>
      <TopBar title={t('reviews')} />
      <div className="p-6 space-y-6">
        {/* Reviewable orders */}
        {deliveredOrders.length > 0 && (
          <div>
            <h3 className="font-bold text-fg mb-3" style={{ fontFamily: 'Outfit' }}>Orders you can review</h3>
            <div className="space-y-2">
              {deliveredOrders.slice(0, 5).map((o: any) => {
                const alreadyReviewed = (myReviews || []).some((r: any) => r.order?._id === o._id || r.order === o._id)
                return (
                  <div key={o._id} className="card p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg text-sm">{o.restaurant?.restaurantName}</p>
                      <p className="text-xs text-fg3 font-mono">{o.code}</p>
                    </div>
                    {alreadyReviewed ? (
                      <span className="text-xs text-emerald-500 font-medium">✓ Reviewed</span>
                    ) : (
                      <button onClick={() => { setShowForm(o); setRating(5); setComment('') }}
                        className="btn-primary text-xs px-4 py-2">
                        Write Review
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* My reviews */}
        <div>
          <h3 className="font-bold text-fg mb-3" style={{ fontFamily: 'Outfit' }}>My Reviews</h3>
          {loading ? <Spinner /> : (myReviews || []).length === 0 ? (
            <div className="text-center py-12 text-fg3">
              <Star size={36} className="mx-auto mb-3 opacity-20" />
              <p>{t('noReviews')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(myReviews || []).map((r: any) => (
                <div key={r._id} className="card p-4 anim-fade">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-fg">{r.restaurant?.restaurantName}</p>
                      <StarRating value={r.rating} size={16} />
                      {r.comment && <p className="text-sm text-fg2 mt-2">{r.comment}</p>}
                      <p className="text-xs text-fg3 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteReview(r._id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review form modal */}
      {showForm && (
        <div className="modal-overlay anim-fade" onClick={() => setShowForm(null)}>
          <div className="card p-6 w-full max-w-md anim-scale" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-fg text-lg mb-1" style={{ fontFamily: 'Outfit' }}>{t('writeReview')}</h2>
            <p className="text-sm text-fg3 mb-5">{showForm.restaurant?.restaurantName}</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-fg3 mb-2 uppercase tracking-wider">{t('rating')}</p>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{t('comment')} (optional)</p>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Share your experience..."
                  className="input-base resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(null)} className="btn-ghost flex-1 py-2.5 text-sm">{t('cancel')}</button>
              <button onClick={submitReview} disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {submitting ? <span className="spinner" /> : null} Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
