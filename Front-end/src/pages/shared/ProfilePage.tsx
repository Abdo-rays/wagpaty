import { useState, useEffect } from 'react'
import { Save, KeyRound, Eye, EyeOff } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import { customersApi } from '../../lib/api/customers.api'
import { restaurantsApi } from '../../lib/api/restaurants.api'
import { uploadApi } from '../../lib/api/upload.api'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { t } = useLang()
  const [tab, setTab] = useState<'profile' | 'password'>('profile')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [avatar, setAvatar] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [passForm, setPassForm] = useState({ currentPassword: '', password: '', confirmPassword: '' })
  const [showPasses, setShowPasses] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [passErrors, setPassErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const api = user?.role === 'restaurant' ? restaurantsApi.getMyProfile : customersApi.getMyProfile
        const res = await api()
        const d = res.data?.data
        if (user?.role === 'restaurant') {
          setForm({ name: d.ownerName || '', phone: d.phone || '', address: d.address || '' })
          setAvatar(d.logo || d.image || '')
        } else {
          setForm({ name: d.name || '', phone: d.phone || '', address: d.address || '' })
          setAvatar(d.profileImage || d.avatar || d.image || '')
        }
      } catch {}
    }
    load()
  }, [user])

  const saveProfile = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const api = user?.role === 'restaurant' ? restaurantsApi.updateMyProfile : customersApi.updateMyProfile
      let payload: any
      if (avatarFile) {
        // Upload first
        setUploadingAvatar(true)
        try {
          const up = await uploadApi.image(avatarFile, 'profiles')
          const d = up.data?.data
          const url = d?.url || d?.path || d || ''
          if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            throw new Error('لم يتم استلام رابط الصورة من الخادم')
          }
          setAvatar(url)
          payload = user?.role === 'restaurant' ? { ownerName: form.name, phone: form.phone, address: form.address, logo: url } : { ...form, profileImage: url }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to upload avatar')
          setUploadingAvatar(false)
          setSaving(false)
          return
        } finally { setUploadingAvatar(false) }
      } else {
        const base = user?.role === 'restaurant' ? { ownerName: form.name, phone: form.phone, address: form.address } : form
        payload = user?.role === 'restaurant' ? { ...base, logo: avatar || undefined } : { ...base, profileImage: avatar || undefined }
      }
      const res = await api(payload)
      const updated = res.data?.data
      const savedImage = user?.role === 'restaurant' ? updated.logo : updated.profileImage
      setAvatar(savedImage || avatar)
      setAvatarFile(null)
      setUser({ ...user!, name: updated.name || updated.ownerName || user!.name, profileImage: updated.profileImage || user!.profileImage, logo: updated.logo || user!.logo })
      setSuccess(t('savedSuccessfully'))
      setTimeout(() => setSuccess(''), 2500)
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    const url = URL.createObjectURL(f)
    setAvatar(url)
  }

  const savePassword = async () => {
    const e: Record<string, string> = {}
    if (!passForm.currentPassword) e.currentPassword = 'Current password is required'
    if (passForm.password.length < 8) e.password = 'Min 8 characters'
    if (!passForm.confirmPassword) e.confirmPassword = 'Please confirm your new password'
    else if (passForm.password !== passForm.confirmPassword) e.confirmPassword = "Passwords don't match"
    setPassErrors(e)
    if (Object.keys(e).length) return

    setSavingPass(true); setError('')
    try {
      const api = user?.role === 'restaurant' ? restaurantsApi.changePassword : customersApi.changePassword
      await api(passForm)
      setPassForm({ currentPassword: '', password: '', confirmPassword: '' })
      setSuccess('Password updated successfully!')
      setTimeout(() => setSuccess(''), 2500)
    } catch (err: any) {
      setPassErrors({ currentPassword: err.response?.data?.message || t('error') })
    } finally {
      setSavingPass(false)
    }
  }

  const displayName = user?.role === 'restaurant' ? (user.restaurantName || user.name) : user?.name

  return (
    <div>
      <TopBar title={t('profile')} />
      <div className="p-6 max-w-xl space-y-5">
        {/* Header */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{displayName?.charAt(0).toUpperCase()}</div>
            )}
            <label className="absolute -bottom-2 -right-2">
              <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'var(--primary)' }}>
                {uploadingAvatar ? '...' : '✎'}
              </div>
            </label>
          </div>
          <div>
            <h2 className="font-bold text-fg text-lg" style={{ fontFamily: 'Outfit' }}>{displayName}</h2>
            <p className="text-sm text-fg2 capitalize">{user?.role}</p>
            <p className="text-xs font-mono text-fg3 mt-0.5 px-2 py-0.5 rounded inline-block"
              style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}>{user?.code}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['profile', 'password'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${tab === tb ? 'text-white' : 'btn-ghost'}`}
              style={tab === tb ? { background: 'linear-gradient(135deg,#E63946,#C1121F)' } : {}}>
              {tb === 'password' ? t('changePassword') : t('profile')}
            </button>
          ))}
        </div>

        {success && (
          <div className="rounded-xl px-4 py-3 text-sm anim-bounce"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
            ✓ {success}
          </div>
        )}

        <div className="card p-6 anim-fade">
          {tab === 'profile' ? (
            <div className="space-y-4">
              {[
                { label: user?.role === 'restaurant' ? 'Owner Name' : t('fullName'), key: 'name', type: 'text' },
                { label: t('phone'), key: 'phone', type: 'tel' },
                { label: t('address'), key: 'address', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                    className="input-base" />
                </div>
              ))}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={saveProfile} disabled={saving}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
                style={{ background: success ? '#10B981' : undefined }}>
                {saving ? <span className="spinner" /> : <Save size={14} />}
                {success ? t('savedSuccessfully') : t('save')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                  <KeyRound size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="font-semibold text-fg">{t('changePassword')}</p>
                  <p className="text-xs text-fg3">Choose a strong, secure password</p>
                </div>
              </div>

              {[
                { label: t('currentPassword'), key: 'currentPassword', show: showPasses.current, toggle: () => setShowPasses(s => ({ ...s, current: !s.current })) },
                { label: t('newPassword'), key: 'password', show: showPasses.new, toggle: () => setShowPasses(s => ({ ...s, new: !s.new })) },
                { label: t('confirmPassword'), key: 'confirmPassword', show: showPasses.confirm, toggle: () => setShowPasses(s => ({ ...s, confirm: !s.confirm })) },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-fg3 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <div className="relative">
                    <input type={f.show ? 'text' : 'password'}
                      value={(passForm as any)[f.key]}
                      onChange={e => setPassForm(pf => ({ ...pf, [f.key]: e.target.value }))}
                      placeholder="••••••••"
                      className={`input-base pr-10 ${passErrors[f.key] ? 'border-red-500' : ''}`} />
                    <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg3 hover:text-fg2">
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passErrors[f.key] && <p className="text-red-400 text-xs mt-1">⚠ {passErrors[f.key]}</p>}
                </div>
              ))}

              <button onClick={savePassword} disabled={savingPass} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                {savingPass ? <span className="spinner" /> : <KeyRound size={14} />}
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
