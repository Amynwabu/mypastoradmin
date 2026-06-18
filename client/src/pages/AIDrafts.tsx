import { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { ai as aiApi } from '../lib/api'
import { PageHeader, Card } from '../components/ui'

const TYPES = [
  { value: 'devotional',          label: 'Monday Devotional',     desc: 'Weekly message to all members' },
  { value: 'birthday',            label: 'Birthday Prayer',        desc: 'Personalised birthday message' },
  { value: 'announcement',        label: 'Event Announcement',     desc: 'WhatsApp-ready event notice' },
  { value: 'appreciation',        label: 'Appreciation Note',      desc: 'Thank a faithful member' },
  { value: 'care_acknowledgement', label: 'Care Acknowledgement',  desc: 'Safe pastoral care response' },
  { value: 'follow_up',           label: 'Evangelism Follow-up',  desc: 'Visitor re-engagement message' },
]

export default function AIDrafts() {
  const [type, setType] = useState('devotional')
  const [context, setContext] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const selected = TYPES.find(t => t.value === type)!

  async function generate() {
    setLoading(true)
    setDraft('')
    try {
      const result = await aiApi.draft(type, context)
      setDraft(result.draft)
      setProvider(result.provider)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  async function copy() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader title="AI Drafts" subtitle="Generate ministry messages with Claude AI" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Config panel */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Message type</h2>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setContext({}) }}
                  className={`text-left p-3 rounded-xl border transition-all ${type === t.value ? 'bg-amber-500/12 border-amber-500/40 text-white' : 'border-white/8 text-muted hover:border-white/16 hover:text-slate-300'}`}
                >
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-[11px] mt-0.5 opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Context — {selected.label}</h2>
            <div className="space-y-3">
              {type === 'devotional' && (
                <div><label className="label">Theme (optional)</label><input className="input" placeholder="e.g. Walking in faith" value={context.theme ?? ''} onChange={e => setContext(c => ({ ...c, theme: e.target.value }))} /></div>
              )}
              {(type === 'birthday' || type === 'appreciation') && (
                <>
                  <div><label className="label">Member name *</label><input className="input" value={context.name ?? ''} onChange={e => setContext(c => ({ ...c, name: e.target.value }))} /></div>
                  <div><label className="label">Department</label><input className="input" placeholder="e.g. Prayer, Choir" value={context.department ?? ''} onChange={e => setContext(c => ({ ...c, department: e.target.value }))} /></div>
                </>
              )}
              {type === 'announcement' && (
                <>
                  <div><label className="label">Event name *</label><input className="input" value={context.eventName ?? ''} onChange={e => setContext(c => ({ ...c, eventName: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Date</label><input className="input" type="date" value={context.date ?? ''} onChange={e => setContext(c => ({ ...c, date: e.target.value }))} /></div>
                    <div><label className="label">Time</label><input className="input" type="time" value={context.time ?? ''} onChange={e => setContext(c => ({ ...c, time: e.target.value }))} /></div>
                  </div>
                  <div><label className="label">Location</label><input className="input" value={context.location ?? ''} onChange={e => setContext(c => ({ ...c, location: e.target.value }))} /></div>
                </>
              )}
              {type === 'care_acknowledgement' && (
                <div><label className="label">Situation summary (not sent to member)</label><textarea className="input h-24 resize-none" value={context.summary ?? ''} onChange={e => setContext(c => ({ ...c, summary: e.target.value }))} /></div>
              )}
              {type === 'follow_up' && (
                <>
                  <div><label className="label">Visitor name *</label><input className="input" value={context.name ?? ''} onChange={e => setContext(c => ({ ...c, name: e.target.value }))} /></div>
                  <div><label className="label">Event they attended</label><input className="input" value={context.eventName ?? ''} onChange={e => setContext(c => ({ ...c, eventName: e.target.value }))} /></div>
                </>
              )}
            </div>
            <button onClick={generate} disabled={loading} className="mt-4 btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
              {loading ? 'Generating…' : 'Generate draft'}
            </button>
          </Card>
        </div>

        {/* Draft output */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Draft</h2>
            {draft && (
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {draft ? (
            <>
              <pre className="flex-1 whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-sans bg-[#020617] rounded-xl p-4 border border-white/8 min-h-[300px]">
                {draft}
              </pre>
              <p className="text-[11px] text-muted mt-3">
                Generated by {provider === 'anthropic' ? 'Claude AI' : 'template fallback'} · Review before sending · Always personalise
              </p>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/8 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-amber-400/60" />
              </div>
              <p className="text-sm text-muted">Choose a type, fill in context,<br />and generate your draft.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
