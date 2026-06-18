import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Heart, Share2, BookOpen, ArrowRight, TrendingUp } from 'lucide-react'
import { analytics } from '../lib/api'
import type { AnalyticsSummary } from '../lib/api'
import { useAuth } from '../lib/auth'
import { StatCard, Card, Spinner } from '../components/ui'
import { formatDate, cn } from '../lib/utils'

const deptColors: Record<string, string> = {
  Prayer: '#a855f7', Choir: '#3b82f6', Admin: '#22c55e', Finance: '#f59e0b',
  Evangelism: '#f97316', Media: '#06b6d4', Leaders: '#ec4899', General: '#94a3b8',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analytics.summary().then(setData).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] ?? 'Pastor'

  if (loading) return <Spinner />

  const t = data?.totals

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-muted text-sm mb-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold text-white">
          {greeting}, <span className="text-amber-400">{firstName}</span> 👋
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users}    label="Active members"   value={t?.members ?? 0}           color="#f59e0b" />
        <StatCard icon={Calendar} label="Events"           value={t?.events ?? 0}            color="#3b82f6" />
        <StatCard icon={Heart}    label="Open care"        value={t?.openCareRequests ?? 0}  color="#ec4899" />
        <StatCard icon={BookOpen} label="Prayer sessions"  value={t?.prayerSessions ?? 0}    color="#a855f7" />
        <StatCard icon={Share2}   label="Evangelism leads" value={t?.evangelismContacts ?? 0} color="#f97316" />
        <StatCard icon={TrendingUp} label="Pending drafts" value={t?.drafts ?? 0}            color="#22c55e" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Upcoming events */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Upcoming Events</h2>
            <Link to="/app/events" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data?.upcomingEvents?.length ? (
            <div className="space-y-3">
              {data.upcomingEvents.slice(0, 4).map(ev => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{ev.name}</div>
                    <div className="text-xs text-muted">{formatDate(ev.date)} · {ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No upcoming events</p>
          )}
        </Card>

        {/* Departments breakdown */}
        <Card className="p-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Members by Department</h2>
          <div className="space-y-2.5">
            {Object.entries(data?.byDepartment ?? {}).map(([dept, count]) => {
              const total = t?.members || 1
              const pct = Math.round((count / total) * 100)
              const color = deptColors[dept] ?? '#94a3b8'
              return (
                <div key={dept}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{dept}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/app/members', label: 'Add a member', desc: 'Register someone new', icon: Users, color: '#f59e0b' },
              { to: '/app/prayer', label: 'Generate prayer rota', desc: 'Next week\'s schedule', icon: BookOpen, color: '#a855f7' },
              { to: '/app/ai', label: 'Draft a message', desc: 'AI-assisted content', icon: Share2, color: '#22c55e' },
              { to: '/app/care', label: 'Log care request', desc: 'Pastoral follow-up', icon: Heart, color: '#ec4899' },
            ].map(({ to, label, desc, icon: Icon, color }) => (
              <Link key={to} to={to}
                className={cn('flex items-center gap-3 p-3 rounded-xl border border-white/6 hover:border-white/12 hover:bg-white/3 transition-all group')}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
