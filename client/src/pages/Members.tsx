import { useEffect, useState } from 'react'
import { Users, Plus, Search, Pencil, Trash2, Phone } from 'lucide-react'
import { members as membersApi } from '../lib/api'
import type { Member } from '../lib/api'
import { PageHeader, Card, Badge, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate, initials, DEPARTMENTS, DEDICATION_LEVELS } from '../lib/utils'

const dedicationColor: Record<string, 'green' | 'amber' | 'blue' | 'gray'> = {
  Core: 'green', Active: 'blue', Regular: 'amber', Irregular: 'gray'
}

export default function Members() {
  const [list, setList] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [form, setForm] = useState<Partial<Member>>({ active: true, department: 'General', dedicationLevel: 'Regular' })
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (deptFilter) params.department = deptFilter
    membersApi.list(params).then(setList).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, deptFilter])

  function openAdd() { setEditing(null); setForm({ active: true, department: 'General', dedicationLevel: 'Regular' }); setShowForm(true) }
  function openEdit(m: Member) { setEditing(m); setForm(m); setShowForm(true) }

  async function save() {
    setSaving(true)
    try {
      if (editing) {
        const updated = await membersApi.update(editing.id, form)
        setList(l => l.map(m => m.id === updated.id ? updated : m))
      } else {
        const created = await membersApi.create(form)
        setList(l => [created, ...l])
      }
      setShowForm(false)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('Remove this member?')) return
    await membersApi.delete(id)
    setList(l => l.filter(m => m.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${list.length} members`}
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add member</button>}
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input className="input pl-9" placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <Card>
          {list.length === 0 ? (
            <EmptyState icon={Users} title="No members yet" description="Add your first member to get started." />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8 text-xs text-muted uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Name</th>
                  <th className="text-left px-4 py-3.5 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3.5 hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3.5 hidden lg:table-cell">Dedication</th>
                  <th className="text-left px-4 py-3.5 hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {list.map((m, i) => (
                  <tr key={m.id} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${i === list.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                          {initials(m.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{m.name}</div>
                          {!m.active && <span className="text-[10px] text-red-400">Inactive</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <a href={`tel:${m.phone}`} className="text-sm text-muted hover:text-white flex items-center gap-1.5 transition-colors">
                        <Phone className="w-3 h-3" />{m.phone}
                      </a>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-300">{m.department}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <Badge label={m.dedicationLevel} color={dedicationColor[m.dedicationLevel] ?? 'gray'} />
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted">{formatDate(m.joinDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-white transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit member' : 'Add member'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="label">Full name *</label><input className="input" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label">Phone *</label><input className="input" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp ?? ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
              <div><label className="label">Department</label>
                <select className="input" value={form.department ?? 'General'} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label">Dedication</label>
                <select className="input" value={form.dedicationLevel ?? 'Regular'} onChange={e => setForm(f => ({ ...f, dedicationLevel: e.target.value }))}>
                  {DEDICATION_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label">Birthday (MM-DD)</label><input className="input" placeholder="03-15" value={form.birthday ?? ''} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} /></div>
              <div><label className="label">Join date</label><input className="input" type="date" value={form.joinDate ?? ''} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} /></div>
              <div className="col-span-2"><label className="label">Notes (private)</label><textarea className="input h-20 resize-none" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-amber-500" />
                <label htmlFor="active" className="text-sm text-slate-300">Active member</label>
              </div>
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
