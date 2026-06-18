import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('bg-card border border-white/8 rounded-2xl', className)}>{children}</div>
}

export function Badge({ label, color = 'amber' }: { label: string; color?: 'amber' | 'green' | 'red' | 'blue' | 'purple' | 'gray' }) {
  const colors = {
    amber: 'bg-amber-500/15 text-amber-300',
    green: 'bg-green-500/15 text-green-300',
    red: 'bg-red-500/15 text-red-300',
    blue: 'bg-blue-500/15 text-blue-300',
    purple: 'bg-purple-500/15 text-purple-300',
    gray: 'bg-white/8 text-slate-400',
  }
  return (
    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold', colors[color])}>
      {label}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-40" style={{ background: color }} />
      <div className="relative">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div className="text-2xl font-black text-white mb-0.5">{value}</div>
        <div className="text-xs text-muted">{label}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </Card>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <div className="text-sm font-medium text-white mb-1">{title}</div>
      <div className="text-xs text-muted max-w-xs">{description}</div>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}
