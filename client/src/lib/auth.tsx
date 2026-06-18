import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { auth as authApi } from './api'
import type { User } from './api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mpa_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mpa_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(u => { setUser(u); localStorage.setItem('mpa_user', JSON.stringify(u)) })
      .catch(() => { localStorage.removeItem('mpa_token'); localStorage.removeItem('mpa_user'); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { token, user: u } = await authApi.login(email, password)
    localStorage.setItem('mpa_token', token)
    localStorage.setItem('mpa_user', JSON.stringify(u))
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('mpa_token')
    localStorage.removeItem('mpa_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
