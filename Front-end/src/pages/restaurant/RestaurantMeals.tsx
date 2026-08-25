import { useState } from 'react'
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { mealsApi } from '../../lib/api/meals.api'
import { useLang } from '../../context/LanguageContext'
import { uploadApi } from '../../lib/api/upload.api'
import MealDetailsModal from '../../components/ui/MealDetailsModal'

const CATEGORIES = ['Burgers', 'Pizza', 'Grills & BBQ', 'Sushi', 'Egyptian', 'Italian', 'Chinese', 'Seafood', 'Sandwiches', 'Desserts', 'Healthy', 'Drinks', 'Other']

const EMPTY = { name: '', description: '', price: 0, category: '', image: '', isAvailable: true, discount: { hasDiscount: false, percentage: 0 } }

export default function RestaurantMeals() {
  const { t } = useLang()
  const { data, loading, refetch } = useFetch<any[]>(() => mealsApi.getMyMeals())
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<any>({ ...EMPTY })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [detailsMeal, setDetailsMeal] = useState<any | null>(null)

  const openCreate = () => { setForm({ ...EMPTY, discount: { hasDiscount: false, percentage: 0 } }); setCreating(true); setEditTarget(null) }
  const openEdit  = (m: any) => { setEditTarget(m); setForm({ name: m.name, description: m.description || '', price: m.price, category: m.category, image: m.image || '', isAvailable: m.isAvailable, discount: m.discount || { hasDiscount: false, percentage: 0 } }); setCreating(false) }
  const closeForm = () => { setEditTarget(null); setCreating(false) }

  const save = async () => {
    setSaving(true)
    try {
      // basic client-side validation to avoid server-side required-field errors
      if (!form.name || !String(form.name).trim()) {
        alert('Meal name is required')
        setSaving(false)
        return
      }
      if (!form.category || !String(form.category).trim()) {
        alert('Meal category is required')
        setSaving(false)
        return
      }
      let imageUrl = form.image || undefined
      if (imageFile) {
        setUploadingImage(true)
        const uploaded = await uploadApi.image(imageFile, 'meals')
        imageUrl = uploaded.data.data
        setUploadingImage(false)
      }
      const payload = { ...form, image: imageUrl }
      if (editTarget) await mealsApi.update(editTarget._id, payload)
      else await mealsApi.create(payload)
      refetch(); closeForm()
    } catch {} finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this meal?')) return
    try { await mealsApi.delete(id); refetch() } catch {}
  }

  const meals = data || []
  const showForm = editTarget || creating

  return (
    <div>
      <TopBar title={t('myMeals')} subtitle={`${meals.length} items on menu`} />
      <div className="p-6 space-y-5">
        <div className="flex justify-end">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
            <Plus size={16} /> {t('addMeal')}
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {meals.map((m: any) => {
              const finalPrice = m.discount?.hasDiscount ? Math.round(m.price * (1 - m.discount.percentage / 100)) : m.price
              return (
                <div key={m._id} className="card overflow-hidden hover:shadow-md transition-shadow anim-fade cursor-pointer" onClick={() => setDetailsMeal(m)}>
                  <div className="relative">
                    <div className="w-full h-36 bg-alt">
                      {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
                    </div>
                    {m.discount?.hasDiscount && (
                      <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#E63946' }}>
                        -{m.discount.percentage}%
                      </span>
                    )}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${m.isAvailable ? 'text-emerald-600' : 'text-fg3'}`}
                      style={{ background: m.isAvailable ? 'rgba(16,185,129,0.12)' : 'var(--bg-alt)', border: `1px solid ${m.isAvailable ? 'rgba(16,185,129,0.25)' : 'var(--card-border)'}` }}>
                      {m.isAvailable ? t('available') : t('unavailable')}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{m.name}</h3>
                    <p className="text-xs text-fg3">{m.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-fg">EGP {finalPrice}</span>
                      {m.discount?.hasDiscount && <span className="text-xs text-fg3 line-through">EGP {m.price}</span>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={event => { event.stopPropagation(); openEdit(m) }} className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1">
                        <Edit3 size={11} /> {t('edit')}
                      </button>
                      <button onClick={event => { event.stopPropagation(); del(m._id) }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {meals.length === 0 && <div className="col-span-full py-12 text-center text-fg3">{t('noData')}</div>}
          </div>
        )}
      </div>

      <MealDetailsModal meal={detailsMeal} onClose={() => setDetailsMeal(null)} />
      {showForm && (
        <div className="modal-overlay anim-fade" onClick={closeForm}>
          <div className="card p-6 w-full max-w-md anim-scale overflow-y-auto" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-fg text-lg" style={{ fontFamily: 'Outfit' }}>{editTarget ? t('editMeal') : t('addMeal')}</h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg3" style={{ background: 'var(--bg-alt)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="space-y-3.5">
              {[
                { label: t('mealName'), key: 'name', placeholder: 'Classic Burger' },
                { label: t('description'), key: 'description', placeholder: 'A delicious...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm((fm: any) => ({ ...fm, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-base" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">Image</label>
                <input type="file" accept="image/*" className="input-base" onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setImageFile(f)
                  // preview locally
                  const url = URL.createObjectURL(f)
                  setForm((fm: any) => ({ ...fm, image: url }))
                }} />
                {form.image && <img src={form.image} alt="preview" className="w-full h-36 object-cover rounded-md mt-2" />}
              </div>
              <div>
                <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{t('category')}</label>
                <select value={form.category} onChange={e => setForm((fm: any) => ({ ...fm, category: e.target.value }))} className="input-base">
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{t('price')} (EGP)</label>
                  <input type="number" min="0" value={form.price} onChange={e => setForm((fm: any) => ({ ...fm, price: +e.target.value }))} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{t('discountPercentage')}</label>
                  <input type="number" min="0" max="100" value={form.discount.percentage}
                    onChange={e => setForm((fm: any) => ({ ...fm, discount: { ...fm.discount, percentage: +e.target.value, hasDiscount: +e.target.value > 0 } }))}
                    className="input-base" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div className={`w-10 h-6 rounded-full relative transition-colors ${form.isAvailable ? '' : ''}`}
                  style={{ background: form.isAvailable ? '#10B981' : 'var(--fg-3)' }}
                  onClick={() => setForm((fm: any) => ({ ...fm, isAvailable: !fm.isAvailable }))}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-fg2">{t('available')}</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={closeForm} className="btn-ghost flex-1 py-2.5 text-sm">{t('cancel')}</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5">
                {saving ? <span className="spinner" /> : <Check size={14} />}
                {editTarget ? t('save') : t('addMeal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
