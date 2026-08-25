import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout, { AuthField, AuthBtn } from './AuthLayout'
import { authApi } from '../../lib/api/auth.api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { email = '' } = (useLocation().state as any) || {}
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => { refs.current[0]?.focus() }, [])

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handleVerifyOtp = async () => {
    setApiError('')
    if (otp.join('').length < 6) { setApiError('Enter the 6-digit code'); return }
    // Move to password step — full reset on submit
    setStep('password')
  }

  const handleReset = async () => {
    const e: Record<string, string> = {}
    if (password.length < 8) e.password = 'Minimum 8 characters'
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = "Passwords don't match"
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    setApiError('')
    try {
      await authApi.resetPassword({ email, otp: otp.join(''), password, confirmPassword })
      navigate('/login', { state: { reset: true } })
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Reset failed. Code may be expired.')
      if (err.response?.status === 400) setStep('otp')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset your password"
      subtitle={step === 'otp' ? (email ? `Enter the code sent to ${email}` : 'Enter your reset code') : 'Choose a strong new password'}>
      {step === 'otp' ? (
        <div className="space-y-6">
          <div className="flex gap-2 sm:gap-3 justify-center" dir="ltr">
            {otp.map((digit, i) => (
              <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric"
                maxLength={1} value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) refs.current[i - 1]?.focus() }}
                className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all text-white
                  ${digit ? 'border-red-500' : 'border-slate-700 focus:border-red-500'}`}
                style={{ background: digit ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)' }}
              />
            ))}
          </div>
          {apiError && <p className="text-center text-red-400 text-sm">{apiError}</p>}
          <AuthBtn onClick={handleVerifyOtp}>Verify Code & Continue</AuthBtn>
        </div>
      ) : (
        <div className="space-y-4 anim-fade">
          <AuthField label="New Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword}
            placeholder="Min 8 characters" error={errors.password}
            extra={<button onClick={() => setShowPass(s => !s)} className="text-slate-500 hover:text-slate-300">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          <AuthField label="Confirm New Password" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={setConfirmPassword}
            placeholder="Repeat new password" error={errors.confirmPassword}
            extra={<button onClick={() => setShowConfirm(s => !s)} className="text-slate-500 hover:text-slate-300">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          {apiError && <p className="text-red-400 text-sm">{apiError}</p>}
          <AuthBtn onClick={handleReset} loading={loading}>Reset Password</AuthBtn>
          <p className="text-center">
            <button onClick={() => setStep('otp')} className="text-sm text-slate-500 hover:text-slate-300">← Back to code</button>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
