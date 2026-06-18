import { useEffect, useState } from 'react'
import { BookOpen, Plus, RefreshCw } from 'lucide-react'
import { prayer as prayerApi } from '../lib/api'
import type { PrayerSession } from '../lib/api'
import { PageHeader, Card, Badge, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate } from '../lib/utils'

const statusColor: Record<string, 'amber' | 'green' | 'gray'> = {
  Scheduled: 'amber', Reminded: 'gray', Completed: 'green'
}

export default function Prayer() {
  const [list, setList] = useState<PrayerSession[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<PrayerSession>>({ status: 'Scheduled', type: 'open' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { prayerApi.list().then(setList).finally(() => setLoading(false)) }, [])

  async function generate() {
    if (!confirm('Generate prayer rota for next week?')) return
    setGenerating(true)
    try {
      const { sessions } = await prayerApi.generate()
      setList(l => [...l, ...sessions])
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed — need at least 2 active Prayer members') }
    finally { setGenerating(false) }
  }

  async function save() {
    setSaving(true)
    try {
      const created = await prayerApi.create(form)
      setList(l => [...l, created])
      setShowForm(false)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function updateStatus(id: string, status: string) {
    const updated = await prayerApi.update(id, { status })
    setList(l => l.map(s => s.id === updated.id ? updated : s))
  }

  const upcoming = list.filter(s => s.date >= new Date().toISOString().slice(0, 10))
  const past = list.filter(s => s.date < new Date().toISOString().slice(0, 10))

  return (
    <div>
      <PageHeader title="Prayer Schedule" subtitle={`${list.length} sessions`}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowForm(true)} className="btn-secondary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add session</button>
            <button onClick={generate} disabled={generating} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />Generate rota
            </button>
          </div>
        }
      />

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No sessions yet" description="Generate a weekly rota or add a session manually." /></Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Upcoming</h2>
              <Card>
                <table className="w-full">
                  <thead><tr className="border-b border-white/8 text-xs text-muted uppercase tracking-wide">
                    <th className="text-left px-5 py-3.5">Session</th>
                    <th className="text-left px-4 py-3.5 hidden sm:table-cell">Date</th>
                    <th className="text-left px-4 py-3.5 hidden md:table-cell">Ministers</th>
                    <th className="text-left px-4 py-3.5">Status</th>
                  </tr></thead>
                  <tbody>
                    {upcoming.map((s, i) => (
                      <tr key={s.id} className={`border-b border-white/5 ${i === upcoming.length - 1 ? 'border-0' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-white">{s.session}</div>
                          <div className="text-xs text-muted">{s.time} · {s.type === 'closed' ? 'Closed' : 'Open'}</div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell text-sm text-muted">{formatDate(s.date)}</td>
                        <td className="px-4 py-4 hidden md:table-cell text-sm text-slate-300">{s.ministerNames?.join(', ') || '—'}</td>
                        <td className="px-4 py-4">
                          <select
                            className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                            value={s.status}
                            onChange={e => updateStatus(s.id, e.target.value)}
                          >
                            {['Scheduled', 'Reminded', 'Completed'].map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Past sessions</h2>
              <Card className="opacity-60">
                <table className="w-full">
                  <tbody>
                    {past.slice(0, 10).map((s, i) => (
                      <tr key={s.id} className={`border-b border-white/5 ${i === Math.min(past.length, 10) - 1 ? 'border-0' : ''}`}>
                        <td className="px-5 py-3"><div className="text-sm text-slate-300">{s.session}</div><div className="text-xs text-muted">{formatDate(s.date)}</div></td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-muted">{s.ministerNames?.join(', ')}</td>
                        <td className="px-4 py-3"><Badge label={s.status} color={statusColor[s.status] ?? 'gray'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Add prayer session" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div><label className="label">Session name *</label><input className="input" placeholder="Monday Prayer Team" value={form.session ?? ''} onChange={e => setForm(f => ({ ...f, session: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Date</label><input className="input" type="date" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><label className="label">Time</label><input className="input" type="time" value={form.time ?? ''} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
            </div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type ?? 'open'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="open">Open (all members)</option>
                <option value="closed">Closed (prayer team only)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 text-sm disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
