import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type UserRole = 'admin' | 'restaurant' | 'customer'

export interface AuthUser {
  id: string
  name: string
  restaurantName?: string
  email: string
  role: UserRole
  code: string
  isVerified: boolean
  profileImage?: string
  logo?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  setUser: (u: AuthUser) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Keep authentication isolated per tab so separate users do not overwrite each other.
    localStorage.removeItem('auth')
    const stored = sessionStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.user && parsed?.token) {
          setUserState(parsed.user)
          setToken(parsed.token)
        } else {
          sessionStorage.removeItem('auth')
        }
      } catch {
        sessionStorage.removeItem('auth')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (u: AuthUser, t: string) => {
    setUserState(u)
    setToken(t)
    sessionStorage.setItem('auth', JSON.stringify({ user: u, token: t }))
  }

  const logout = () => {
    setUserState(null)
    setToken(null)
    sessionStorage.removeItem('auth')
  }

  const setUser = (u: AuthUser) => {
    setUserState(u)
    const stored = sessionStorage.getItem('auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      sessionStorage.setItem('auth', JSON.stringify({ ...parsed, user: u }))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
