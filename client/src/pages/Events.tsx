import { useEffect, useState } from 'react'
import { Calendar, Plus, Pencil, Trash2, MapPin, Clock } from 'lucide-react'
import { events as eventsApi } from '../lib/api'
import type { ChurchEvent } from '../lib/api'
import { PageHeader, Card, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate } from '../lib/utils'

export default function Events() {
  const [list, setList] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ChurchEvent | null>(null)
  const [form, setForm] = useState<Partial<ChurchEvent>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { eventsApi.list().then(setList).finally(() => setLoading(false)) }, [])

  function openAdd() { setEditing(null); setForm({ date: new Date().toISOString().slice(0, 10), time: '10:00', targetGroup: 'All Members' }); setShowForm(true) }
  function openEdit(ev: ChurchEvent) { setEditing(ev); setForm(ev); setShowForm(true) }

  async function save() {
    setSaving(true)
    try {
      if (editing) {
        const updated = await eventsApi.update(editing.id, form)
        setList(l => l.map(e => e.id === updated.id ? updated : e))
      } else {
        const created = await eventsApi.create(form)
        setList(l => [created, ...l])
      }
      setShowForm(false)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return
    await eventsApi.delete(id)
    setList(l => l.filter(e => e.id !== id))
  }

  const upcoming = list.filter(e => e.date >= new Date().toISOString().slice(0, 10))
  const past = list.filter(e => e.date < new Date().toISOString().slice(0, 10))

  return (
    <div>
      <PageHeader title="Events" subtitle={`${list.length} total`}
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add event</button>}
      />

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={Calendar} title="No events yet" description="Schedule your first event." /></Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Upcoming</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map(ev => <EventCard key={ev.id} ev={ev} onEdit={openEdit} onDelete={remove} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Past</h2>
              <div className="grid gap-3 sm:grid-cols-2 opacity-60">
                {past.map(ev => <EventCard key={ev.id} ev={ev} onEdit={openEdit} onDelete={remove} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit event' : 'Add event'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div><label className="label">Event name *</label><input className="input" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Date</label><input className="input" type="date" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><label className="label">Time</label><input className="input" type="time" value={form.time ?? ''} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
            </div>
            <div><label className="label">Location</label><input className="input" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><label className="label">Description</label><textarea className="input h-20 resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="label">Target group</label>
              <select className="input" value={form.targetGroup ?? 'All Members'} onChange={e => setForm(f => ({ ...f, targetGroup: e.target.value }))}>
                {['All Members', 'Prayer Team', 'Leaders', 'Choir', 'Youth'].map(g => <option key={g} value={g}>{g}</option>)}
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

function EventCard({ ev, onEdit, onDelete }: { ev: ChurchEvent; onEdit: (ev: ChurchEvent) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(ev)} className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(ev.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-white mb-2">{ev.name}</h3>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Clock className="w-3.5 h-3.5" />{formatDate(ev.date)} · {ev.time}
        </div>
        {ev.location && <div className="flex items-center gap-2 text-xs text-muted"><MapPin className="w-3.5 h-3.5" />{ev.location}</div>}
        {ev.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ev.description}</p>}
      </div>
    </Card>
  )
}
