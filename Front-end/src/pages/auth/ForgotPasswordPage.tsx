import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import AuthLayout, { AuthField, AuthBtn } from './AuthLayout'
import { authApi } from '../../lib/api/auth.api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email.includes('@')) { setError('Please enter a valid email'); return }
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'No account found with this email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll send a reset code to your email">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)' }}>
          <KeyRound size={28} className="text-red-400" />
        </div>
      </div>

      {sent ? (
        <div className="text-center anim-bounce">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-emerald-400 font-semibold text-lg">Reset code sent!</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to reset page...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AuthField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={error} />
          <AuthBtn onClick={handleSubmit} loading={loading}>Send Reset Code</AuthBtn>
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="text-red-400 hover:text-red-300 transition-colors">← Back to login</Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
