import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import {
  LayoutDashboard, Users, Calendar, BookOpen, Heart, DollarSign,
  Share2, Sparkles, MessageSquare, Settings, LogOut, ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/members', label: 'Members', icon: Users },
  { to: '/app/events', label: 'Events', icon: Calendar },
  { to: '/app/prayer', label: 'Prayer', icon: BookOpen },
  { to: '/app/care', label: 'Care', icon: Heart },
  { to: '/app/finance', label: 'Finance', icon: DollarSign },
  { to: '/app/evangelism', label: 'Evangelism', icon: Share2 },
  { to: '/app/ai', label: 'AI Drafts', icon: Sparkles },
  { to: '/app/messages', label: 'Messages', icon: MessageSquare },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/8 bg-[#0a0f1e]">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Ministry Ops</div>
          <div className="text-lg font-bold text-white">MyPastorAdmin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
              {user?.name?.charAt(0) ?? 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name ?? 'Pastor'}</div>
              <div className="text-[11px] text-muted capitalize">{user?.role ?? 'pastor'}</div>
            </div>
            <button onClick={handleLogout} className="text-muted hover:text-white transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
