import { useEffect, useState } from 'react'
import { Heart, Plus } from 'lucide-react'
import { care as careApi } from '../lib/api'
import type { CareRequest } from '../lib/api'
import { PageHeader, Card, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate } from '../lib/utils'


export default function Care() {
  const [list, setList] = useState<CareRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CareRequest>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { careApi.list().then(setList).finally(() => setLoading(false)) }, [])

  async function save() {
    setSaving(true)
    try {
      const created = await careApi.create(form)
      setList(l => [created, ...l])
      setShowForm(false)
      setForm({})
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function updateStatus(id: string, status: string) {
    const updated = await careApi.update(id, { status })
    setList(l => l.map(c => c.id === updated.id ? updated : c))
  }

  const open = list.filter(c => c.status === 'Open' || c.status === 'In Progress')
  const closed = list.filter(c => c.status === 'Resolved' || c.status === 'Closed')

  return (
    <div>
      <PageHeader title="Pastoral Care" subtitle="Restricted to pastoral team"
        action={<button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Log request</button>}
      />

      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-200 mb-6">
        🔒 Care records are private to the pastoral team. Members cannot see this data.
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={Heart} title="No care requests" description="Log a pastoral care request to track follow-up." /></Card>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Open ({open.length})</h2>
              <div className="space-y-3">
                {open.map(c => <CareCard key={c.id} care={c} onStatusChange={updateStatus} />)}
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Resolved</h2>
              <div className="space-y-3 opacity-60">
                {closed.map(c => <CareCard key={c.id} care={c} onStatusChange={updateStatus} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Log care request" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div><label className="label">Member name *</label><input className="input" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">Summary (private)</label><textarea className="input h-28 resize-none" placeholder="Brief description of the situation…" value={form.summary ?? ''} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} /></div>
            <div><label className="label">Assign to</label><input className="input" placeholder="Pastor / care team member" value={form.assignedTo ?? ''} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} /></div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 text-sm disabled:opacity-60">{saving ? 'Saving…' : 'Log request'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CareCard({ care, onStatusChange }: { care: CareRequest; onStatusChange: (id: string, status: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/15 flex items-center justify-center text-xs font-bold text-pink-400">
              {care.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{care.name}</div>
              <div className="text-xs text-muted">{formatDate(care.createdAt)}{care.assignedTo ? ` · ${care.assignedTo}` : ''}</div>
            </div>
          </div>
          {care.summary && <p className="text-sm text-slate-300 mt-2 leading-relaxed">{care.summary}</p>}
        </div>
        <select
          className="ml-4 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white shrink-0"
          value={care.status}
          onChange={e => onStatusChange(care.id, e.target.value)}
        >
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </Card>
  )
}
