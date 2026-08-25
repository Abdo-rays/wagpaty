import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, Store, User } from 'lucide-react'
import AuthLayout, { AuthField, AuthBtn } from './AuthLayout'
import { authApi } from '../../lib/api/auth.api'

const CATEGORIES = ['Burgers', 'Pizza', 'Grills & BBQ', 'Sushi & Japanese', 'Egyptian', 'Italian', 'Chinese', 'Seafood', 'Sandwiches', 'Desserts', 'Healthy', 'Other']

export default function SignupPage() {
  const { type } = useParams<{ type: 'customer' | 'restaurant' }>()
  const navigate = useNavigate()
  const isRest = type === 'restaurant'

  const [form, setForm] = useState({
    name: '', ownerName: '', restaurantName: '',
    email: '', password: '', confirmPassword: '',
    phone: '', address: '', category: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (isRest) {
      if (!form.ownerName.trim()) e.ownerName = 'Owner name is required'
      if (!form.restaurantName.trim()) e.restaurantName = 'Restaurant name is required'
      if (!form.address.trim()) e.address = 'Address is required'
      if (!form.category) e.category = 'Category is required'
    } else {
      if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters'
    }
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match"
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      if (isRest) {
        await authApi.restaurantSignup({
          ownerName: form.ownerName,
          restaurantName: form.restaurantName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone,
          address: form.address,
          category: form.category,
        })
      } else {
        await authApi.customerSignup({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone,
        })
      }
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={isRest ? 'Register your restaurant' : 'Create your account'}
      subtitle={isRest ? 'Start receiving orders in minutes' : 'Order from the best restaurants near you'}>
      {/* Type toggle */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([['customer', 'Customer', User], ['restaurant', 'Restaurant', Store]] as const).map(([t, l, Icon]) => (
          <Link key={t} to={`/signup/${t}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === t ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
            style={type === t ? { background: 'linear-gradient(135deg,#E63946,#C1121F)' } : {}}>
            <Icon size={15} />{l}
          </Link>
        ))}
      </div>

      <div className="space-y-3.5">
        {isRest ? (
          <>
            <AuthField label="Owner Name" value={form.ownerName} onChange={set('ownerName')} placeholder="Ahmed Mohamed" error={errors.ownerName} />
            <AuthField label="Restaurant Name" value={form.restaurantName} onChange={set('restaurantName')} placeholder="Burger Palace" error={errors.restaurantName} />
          </>
        ) : (
          <AuthField label="Full Name" value={form.name} onChange={set('name')} placeholder="Mohamed Ali" error={errors.name} />
        )}

        <AuthField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
        <AuthField label="Phone" value={form.phone} onChange={set('phone')} placeholder="+20 100 000 0000" error={errors.phone} />

        {isRest && (
          <>
            <AuthField label="Address" value={form.address} onChange={set('address')} placeholder="12 Tahrir Sq, Cairo" error={errors.address} />
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => set('category')(e.target.value)}
                className={`auth-input ${errors.category ? 'error' : ''}`}>
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.category}</p>}
            </div>
          </>
        )}

        <AuthField label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
          placeholder="Min 8 characters" error={errors.password}
          extra={<button onClick={() => setShowPass(s => !s)} className="text-slate-500 hover:text-slate-300">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />

        <AuthField label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
          placeholder="Repeat your password" error={errors.confirmPassword}
          extra={<button onClick={() => setShowConfirm(s => !s)} className="text-slate-500 hover:text-slate-300">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />

        {isRest && (
          <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
            ⚠️ Restaurant accounts require admin approval before going live.
          </div>
        )}

        {apiError && (
          <div className="rounded-xl px-4 py-3 text-sm anim-fade"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
            {apiError}
          </div>
        )}

        <AuthBtn onClick={handleSubmit} loading={loading}>Create Account & Verify Email</AuthBtn>

        <p className="text-center text-sm text-slate-500 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
