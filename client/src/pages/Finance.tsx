import { useEffect, useState } from 'react'
import { DollarSign, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { finance as financeApi } from '../lib/api'
import type { Transaction } from '../lib/api'
import { PageHeader, Card, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate, formatCurrency } from '../lib/utils'

export default function Finance() {
  const [list, setList] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Transaction>>({ type: 'income', currency: 'GBP', date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  useEffect(() => { financeApi.list().then(setList).finally(() => setLoading(false)) }, [])

  const income = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  async function save() {
    setSaving(true)
    try {
      const created = await financeApi.create(form)
      setList(l => [created, ...l])
      setShowForm(false)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Finance" subtitle="Income and expenses"
        action={<button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add transaction</button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-green-400" /></div>
            <div><div className="text-xs text-muted">Income</div><div className="text-lg font-bold text-green-400">{formatCurrency(income)}</div></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-4.5 h-4.5 text-red-400" /></div>
            <div><div className="text-xs text-muted">Expenses</div><div className="text-lg font-bold text-red-400">{formatCurrency(expenses)}</div></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><DollarSign className="w-4.5 h-4.5 text-amber-400" /></div>
            <div><div className="text-xs text-muted">Balance</div><div className={`text-lg font-bold ${income - expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(income - expenses)}</div></div>
          </div>
        </Card>
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={DollarSign} title="No transactions" description="Record your first income or expense." /></Card>
      ) : (
        <Card>
          <table className="w-full">
            <thead><tr className="border-b border-white/8 text-xs text-muted uppercase tracking-wide">
              <th className="text-left px-5 py-3.5">Description</th>
              <th className="text-left px-4 py-3.5 hidden sm:table-cell">Date</th>
              <th className="text-right px-5 py-3.5">Amount</th>
            </tr></thead>
            <tbody>
              {list.map((t, i) => (
                <tr key={t.id} className={`border-b border-white/5 ${i === list.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {t.type === 'income' ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <span className="text-sm text-white">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-sm text-muted">{formatDate(t.date)}</td>
                  <td className={`px-5 py-4 text-right text-sm font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'expense' ? '−' : '+'}{formatCurrency(Number(t.amount), t.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && (
        <Modal title="Add transaction" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'income' | 'expense' }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div><label className="label">Date</label><input className="input" type="date" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Amount *</label><input className="input" type="number" step="0.01" min="0" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
              <div><label className="label">Currency</label>
                <select className="input" value={form.currency ?? 'GBP'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  {['GBP', 'NGN', 'USD', 'EUR', 'GHS'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Description *</label><input className="input" placeholder="Tithes, offerings, venue hire…" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
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
