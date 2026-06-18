import { useEffect, useState } from 'react'
import { Share2, Plus, Pencil } from 'lucide-react'
import { evangelism as evgApi } from '../lib/api'
import type { EvangelismContact } from '../lib/api'
import { PageHeader, Card, Badge, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate } from '../lib/utils'

const statusColor: Record<string, 'amber' | 'green' | 'blue' | 'gray'> = {
  New: 'amber', 'Following Up': 'blue', Connected: 'green', Inactive: 'gray'
}

export default function Evangelism() {
  const [list, setList] = useState<EvangelismContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EvangelismContact | null>(null)
  const [form, setForm] = useState<Partial<EvangelismContact>>({ status: 'New' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { evgApi.list().then(setList).finally(() => setLoading(false)) }, [])

  function openAdd() { setEditing(null); setForm({ status: 'New' }); setShowForm(true) }
  function openEdit(c: EvangelismContact) { setEditing(c); setForm(c); setShowForm(true) }

  async function save() {
    setSaving(true)
    try {
      if (editing) {
        const updated = await evgApi.update(editing.id, form)
        setList(l => l.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await evgApi.create(form)
        setList(l => [created, ...l])
      }
      setShowForm(false)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Evangelism" subtitle={`${list.length} contacts`}
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add contact</button>}
      />

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={Share2} title="No contacts yet" description="Track visitors and evangelism contacts here." /></Card>
      ) : (
        <Card>
          <table className="w-full">
            <thead><tr className="border-b border-white/8 text-xs text-muted uppercase tracking-wide">
              <th className="text-left px-5 py-3.5">Contact</th>
              <th className="text-left px-4 py-3.5 hidden sm:table-cell">Interest</th>
              <th className="text-left px-4 py-3.5 hidden md:table-cell">Event</th>
              <th className="text-left px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5" />
            </tr></thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={c.id} className={`border-b border-white/5 ${i === list.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    {c.phone && <div className="text-xs text-muted">{c.phone}</div>}
                    <div className="text-[11px] text-muted">{formatDate(c.createdAt)}</div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-sm text-slate-300">{c.interest || '—'}</td>
                  <td className="px-4 py-4 hidden md:table-cell text-sm text-muted">{c.eventName || '—'}</td>
                  <td className="px-4 py-4"><Badge label={c.status} color={statusColor[c.status] ?? 'gray'} /></td>
                  <td className="px-4 py-4">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit contact' : 'Add contact'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div><label className="label">Name *</label><input className="input" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Phone</label><input className="input" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="label">Status</label>
                <select className="input" value={form.status ?? 'New'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['New', 'Following Up', 'Connected', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Interest / how they heard</label><input className="input" value={form.interest ?? ''} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} /></div>
            <div><label className="label">Event they attended</label><input className="input" value={form.eventName ?? ''} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} /></div>
            <div><label className="label">Notes</label><textarea className="input h-20 resize-none" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
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
