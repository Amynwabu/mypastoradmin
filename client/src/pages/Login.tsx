import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('pastor@example.com')
  const [password, setPassword] = useState('ChangeMe123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#0f172a,#111827 55%,#1f2937)' }}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">Secure Ministry Ops</div>
          <h1 className="text-3xl font-black text-white">MyPastorAdmin</h1>
          <p className="text-sm text-slate-400 mt-2">Members, prayer, events, giving & AI — in one place.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111827] border border-white/8 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-5">Sign in</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full btn-primary py-3 text-sm disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Demo: pastor@example.com / ChangeMe123!
          </p>
        </form>
      </div>
    </div>
  )
}
