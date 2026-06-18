import { useEffect, useState } from 'react'
import { MessageSquare, CheckCircle, Clock, Send, Radio, Phone } from 'lucide-react'
import { messages as messagesApi } from '../lib/api'
import type { Message } from '../lib/api'
import { PageHeader, Card, EmptyState, Spinner, Modal } from '../components/ui'
import { formatDate } from '../lib/utils'

const typeColor: Record<string, string> = {
  birthday: 'text-amber-300 bg-amber-500/12',
  devotional: 'text-purple-300 bg-purple-500/12',
  announcement: 'text-blue-300 bg-blue-500/12',
  appreciation: 'text-green-300 bg-green-500/12',
  care_acknowledgement: 'text-slate-300 bg-white/8',
  follow_up: 'text-cyan-300 bg-cyan-500/12',
  broadcast: 'text-orange-300 bg-orange-500/12',
}

function TypePill({ type }: { type: string }) {
  const label = type.replace('AI Draft: ', '').replace(/_/g, ' ')
  const cls = typeColor[type.replace('AI Draft: ', '')] ?? 'text-slate-300 bg-white/8'
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}

export default function Messages() {
  const [list, setList] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [sendModal, setSendModal] = useState<Message | null>(null)
  const [sendPhone, setSendPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastDept, setBroadcastDept] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; total: number } | null>(null)

  useEffect(() => { messagesApi.list().then(setList).finally(() => setLoading(false)) }, [])

  async function approve(id: string) {
    setApproving(id)
    try {
      const updated = await messagesApi.approve(id)
      setList(l => l.map(m => m.id === updated.id ? updated : m))
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setApproving(null) }
  }

  function openSend(msg: Message) {
    setSendPhone(msg.recipientPhone ?? '')
    setSendModal(msg)
  }

  async function sendMessage() {
    if (!sendModal) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${sendModal.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('mpa_token')}`
        },
        body: JSON.stringify({ phone: sendPhone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setList(l => l.map(m => m.id === data.message.id ? data.message : m))
      setSendModal(null)
      alert(data.provider === 'simulated'
        ? `✅ Simulated send to ${sendPhone} — set WHATSAPP_API_URL + WHATSAPP_API_TOKEN to send for real.`
        : `✅ Sent to ${sendPhone} (${data.provider}) — SID: ${data.sid}`)
    } catch (e) { alert(e instanceof Error ? e.message : 'Send failed') }
    finally { setSending(false) }
  }

  async function broadcast() {
    if (!broadcastText.trim()) return
    setBroadcasting(true)
    try {
      const res = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('mpa_token')}`
        },
        body: JSON.stringify({ content: broadcastText, department: broadcastDept || undefined, recipientLabel: broadcastDept || 'All Members' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBroadcastResult({ sent: data.sent, total: data.total })
      // refresh message list
      messagesApi.list().then(setList)
    } catch (e) { alert(e instanceof Error ? e.message : 'Broadcast failed') }
    finally { setBroadcasting(false) }
  }

  const pending = list.filter(m => m.status === 'Pending')
  const approved = list.filter(m => m.status === 'Approved')
  const sent = list.filter(m => m.status === 'Sent' || m.status === 'Send Failed')

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Approval-first workflow — approve then send via WhatsApp"
        action={
          <button onClick={() => { setBroadcastModal(true); setBroadcastResult(null); setBroadcastText(''); setBroadcastDept('') }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4" />Broadcast
          </button>
        }
      />

      {/* WhatsApp config notice */}
      <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-200 mb-6">
        💬 WhatsApp sending is in <strong>simulation mode</strong>. Set <code className="bg-white/10 px-1 rounded">WHATSAPP_API_URL</code> and <code className="bg-white/10 px-1 rounded">WHATSAPP_API_TOKEN</code> in <code className="bg-white/10 px-1 rounded">.env</code> to send for real.
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <Card><EmptyState icon={MessageSquare} title="No messages" description="AI-generated drafts and cron-triggered messages appear here for review." /></Card>
      ) : (
        <div className="space-y-6">

          {/* Pending approval */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />Awaiting approval ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(m => (
                  <Card key={m.id} className="p-5 border-amber-500/20">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypePill type={m.type} />
                        <span className="text-xs text-muted">→ {m.recipient}</span>
                      </div>
                      <button
                        onClick={() => approve(m.id)}
                        disabled={approving === m.id}
                        className="btn-primary text-xs px-3 py-1.5 shrink-0 disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {approving === m.id ? 'Approving…' : 'Approve'}
                      </button>
                    </div>
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-[#0a1020] rounded-xl p-4 border border-white/6">
                      {m.content}
                    </pre>
                    <p className="text-[11px] text-muted mt-2">{formatDate(m.createdAt)}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Approved — ready to send */}
          {approved.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />Approved — ready to send ({approved.length})
              </h2>
              <div className="space-y-3">
                {approved.map(m => (
                  <Card key={m.id} className="p-5 border-green-500/15">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypePill type={m.type} />
                        <span className="text-xs text-muted">→ {m.recipient}</span>
                        {m.approvedBy && <span className="text-xs text-green-400">✓ {m.approvedBy}</span>}
                      </div>
                      <button
                        onClick={() => openSend(m)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/25 transition-colors shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />Send via WhatsApp
                      </button>
                    </div>
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-[#0a1020] rounded-xl p-4 border border-white/6 line-clamp-4">
                      {m.content}
                    </pre>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Sent history */}
          {sent.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-slate-400" />Sent history
              </h2>
              <Card className="opacity-75">
                {sent.map((m, i) => (
                  <div key={m.id} className={`px-5 py-4 ${i < sent.length - 1 ? 'border-b border-white/6' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypePill type={m.type} />
                        <span className="text-sm text-slate-300">{m.recipient}</span>
                        {m.sentTo && <span className="text-xs text-muted flex items-center gap-1"><Phone className="w-3 h-3" />{m.sentTo}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {m.status === 'Send Failed'
                          ? <span className="text-xs text-red-400">✗ Failed</span>
                          : <span className="text-xs text-green-400">✓ Sent</span>}
                        <span className="text-xs text-muted">{formatDate(m.sentAt ?? m.createdAt)}</span>
                      </div>
                    </div>
                    {m.sendError && <p className="text-xs text-red-400 mt-1">{m.sendError}</p>}
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <Modal title={`Send to ${sendModal.recipient}`} onClose={() => setSendModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />WhatsApp number</label>
              <input
                className="input"
                placeholder="+447700900000 or +2348011111111"
                value={sendPhone}
                onChange={e => setSendPhone(e.target.value)}
              />
              <p className="text-[11px] text-muted mt-1.5">International format required (e.g. +44… or +234…)</p>
            </div>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans bg-[#0a1020] rounded-xl p-3 border border-white/6 max-h-40 overflow-y-auto">
              {sendModal.content}
            </pre>
            <div className="flex gap-2">
              <button onClick={() => setSendModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={sendMessage} disabled={sending || !sendPhone.trim()}
                className="flex-1 flex items-center justify-center gap-2 btn-primary text-sm disabled:opacity-60">
                <Send className="w-4 h-4" />{sending ? 'Sending…' : 'Send now'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Broadcast modal */}
      {broadcastModal && (
        <Modal title="Broadcast message" onClose={() => setBroadcastModal(false)}>
          {broadcastResult ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">📡</div>
              <div className="text-2xl font-bold text-white mb-1">{broadcastResult.sent} / {broadcastResult.total}</div>
              <div className="text-sm text-muted">messages sent successfully</div>
              <p className="text-xs text-blue-300 mt-3">Running in simulation mode — set WhatsApp env vars to send for real.</p>
              <button onClick={() => setBroadcastModal(false)} className="mt-5 btn-primary text-sm">Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-200">
                ⚠️ Broadcast sends immediately to all active members. No approval step.
              </div>
              <div>
                <label className="label">Department (leave blank for all members)</label>
                <select className="input" value={broadcastDept} onChange={e => setBroadcastDept(e.target.value)}>
                  <option value="">All active members</option>
                  {['Leaders', 'Prayer', 'Choir', 'Admin', 'Evangelism', 'Media', 'Finance', 'Hospitality'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="input h-40 resize-none" placeholder="Type your message…"
                  value={broadcastText} onChange={e => setBroadcastText(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setBroadcastModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={broadcast} disabled={broadcasting || !broadcastText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary text-sm disabled:opacity-60">
                  <Radio className="w-4 h-4" />{broadcasting ? 'Sending…' : 'Broadcast'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
