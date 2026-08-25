import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout, { AuthField, AuthBtn } from './AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../lib/api/auth.api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return

    setError('')

    // Validate fields
    if (!email.trim() || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      // Call API
      const response = await authApi.login({
        email: email.trim(),
        password,
      })

      console.log('LOGIN API RESPONSE:', response.data)

      /*
        Expected backend response:

        {
          status: "success",
          message: "...",
          data: {
            id: "...",
            code: "...",
            email: "...",
            role: "customer"
          },
          token: "eyJ..."
        }
      */

      const responseData = response.data

      // Make sure login was successful
      if (responseData.status !== 'success') {
        throw new Error(
          responseData.message || 'Login failed'
        )
      }

      // User is inside data.data
      const user = responseData.data

      // Token is directly inside data.token
      const token = responseData.token

      // Safety check
      if (!user) {
        throw new Error('User data was not returned from server')
      }

      if (!token) {
        throw new Error('Authentication token was not returned from server')
      }

      if (!user.role) {
        throw new Error('User role was not returned from server')
      }

      console.log('LOGIN USER:', user)
      console.log('LOGIN TOKEN:', token)
      console.log('LOGIN ROLE:', user.role)

      // Save user + token in AuthContext
      login(user, token)

      // Redirect based on role
      const routes: Record<string, string> = {
        admin: '/admin',
        restaurant: '/restaurant',
        customer: '/customer',
      }

      const redirectPath = routes[user.role]

      if (!redirectPath) {
        console.warn('Unknown user role:', user.role)
        navigate('/')
        return
      }

      navigate(redirectPath)
    } catch (err: any) {
      console.error('LOGIN ERROR:', err)

      /*
        If backend returned an error:
        err.response.data.message
      */

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error

      if (backendMessage) {
        setError(backendMessage)
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  // Allow pressing Enter to login
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>

        {/* Email */}
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        {/* Password */}
        <AuthField
          label="Password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          extra={
            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={
                showPass
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPass ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          }
        />

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm anim-fade"
            style={{
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#F87171',
            }}
          >
            {error}
          </div>
        )}

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Login button */}
        <AuthBtn
          type="button"
          onClick={handleLogin}
          loading={loading}
        >
          Sign In
        </AuthBtn>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{
              background: 'rgba(255,255,255,0.07)',
            }}
          />

          <span className="text-slate-600 text-xs">
            or register as
          </span>

          <div
            className="flex-1 h-px"
            style={{
              background: 'rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Signup buttons */}
        <div className="grid grid-cols-2 gap-3">

          <Link
            to="/signup/customer"
            className="text-center py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-red-400"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Customer Signup
          </Link>

          <Link
            to="/signup/restaurant"
            className="text-center py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-red-400"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Restaurant Signup
          </Link>

        </div>
      </div>
    </AuthLayout>
  )
}
