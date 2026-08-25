import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import AuthLayout, { AuthBtn } from './AuthLayout'
import { authApi } from '../../lib/api/auth.api'

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const { email = '' } = (useLocation().state as any) || {}
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    refs.current[0]?.focus()
    const t = setInterval(() => setTimer(n => n > 0 ? n - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (d.length === 6) { setOtp(d.split('')); refs.current[5]?.focus() }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the complete 6-digit code'); return }
    if (!email) { setError('Email not found. Please sign up again.'); return }
    setLoading(true)
    try {
      await authApi.verifyOtp({ email, otp: code })
      navigate('/login', { state: { verified: true } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0 || !email) return
    setResendLoading(true)
    try {
      await authApi.resendOtp({ email })
      setTimer(60); setOtp(['', '', '', '', '', '']); setError('')
      refs.current[0]?.focus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle={email ? `Code sent to ${email}` : 'Enter the 6-digit code'}>
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)' }}>
          <Mail size={28} className="text-red-400" />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handlePaste} dir="ltr">
        {otp.map((digit, i) => (
          <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric"
            maxLength={1} value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all text-white
              ${digit ? 'border-red-500' : 'border-slate-700 focus:border-red-500'}`}
            style={{ background: digit ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)' }}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-red-400 text-sm mb-4">{error}</p>
      )}

      <AuthBtn onClick={handleVerify} loading={loading}>Verify Account</AuthBtn>

      <p className="text-center text-sm text-slate-500 mt-5">
        Didn't receive the code?{' '}
        {timer > 0 ? (
          <span className="text-slate-400">Resend in {timer}s</span>
        ) : (
          <button onClick={handleResend} disabled={resendLoading}
            className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 font-medium transition-colors">
            <RefreshCw size={12} className={resendLoading ? 'animate-spin' : ''} /> Resend
          </button>
        )}
      </p>
    </AuthLayout>
  )
}
