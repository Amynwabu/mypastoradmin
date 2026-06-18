import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { settings as settingsApi } from '../lib/api'
import type { AppSettings } from '../lib/api'
import { PageHeader, Card, Spinner } from '../components/ui'

const CRON_JOBS = [
  { key: 'birthday-check', label: 'Birthday check', desc: 'Finds today\'s birthdays and queues AI draft messages for approval', schedule: 'Auto: 08:00 daily' },
  { key: 'prayer-reminder', label: 'Prayer reminder', desc: 'Sends Monday morning prayer reminder to all active members', schedule: 'Auto: 07:00 Monday' },
  { key: 'midweek', label: 'Midweek encouragement', desc: 'Sends Wednesday encouragement to all active members (auto, no approval)', schedule: 'Auto: 09:00 Wednesday' },
]

export default function Settings() {
  const [form, setForm] = useState<Partial<AppSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [triggerState, setTriggerState] = useState<Record<string, 'idle' | 'running' | 'done' | 'error'>>({})
  const [triggerMsg, setTriggerMsg] = useState<Record<string, string>>({})

  useEffect(() => { settingsApi.get().then(setForm).finally(() => setLoading(false)) }, [])

  async function save() {
    setSaving(true)
    try {
      await settingsApi.save(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function trigger(key: string) {
    setTriggerState(s => ({ ...s, [key]: 'running' }))
    setTriggerMsg(m => ({ ...m, [key]: '' }))
    try {
      const res = await fetch(`/api/settings/trigger/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('mpa_token')}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTriggerState(s => ({ ...s, [key]: 'done' }))
      setTriggerMsg(m => ({ ...m, [key]: data.message }))
      setTimeout(() => setTriggerState(s => ({ ...s, [key]: 'idle' })), 4000)
    } catch (e) {
      setTriggerState(s => ({ ...s, [key]: 'error' }))
      setTriggerMsg(m => ({ ...m, [key]: e instanceof Error ? e.message : 'Failed' }))
      setTimeout(() => setTriggerState(s => ({ ...s, [key]: 'idle' })), 5000)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Settings" subtitle="Fellowship configuration & scheduled jobs" />

      <div className="max-w-xl space-y-6">

        {/* Fellowship details */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-amber-400" />Fellowship details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Fellowship name</label>
              <input className="input" value={form.fellowshipName ?? ''} onChange={e => setForm(f => ({ ...f, fellowshipName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Pastor name</label>
              <input className="input" value={form.pastorName ?? ''} onChange={e => setForm(f => ({ ...f, pastorName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Timezone</label>
              <select className="input" value={form.timezone ?? 'Europe/London'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                {['Europe/London', 'Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'America/New_York', 'America/Los_Angeles', 'Europe/Berlin', 'Asia/Dubai'].map(tz =>
                  <option key={tz} value={tz}>{tz}</option>
                )}
              </select>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="mt-5 btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save settings'}
          </button>
        </Card>

        {/* Scheduled jobs */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Play className="w-4 h-4 text-amber-400" />Scheduled jobs
          </h2>
          <p className="text-xs text-muted mb-5">Run any job manually to test it. Cron jobs run automatically at the times shown.</p>
          <div className="space-y-4">
            {CRON_JOBS.map(({ key, label, desc, schedule }) => {
              const state = triggerState[key] ?? 'idle'
              const msg = triggerMsg[key]
              return (
                <div key={key} className="border border-white/8 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-muted mt-0.5">{desc}</div>
                      <div className="text-[11px] text-amber-400/70 mt-1">{schedule}</div>
                      {msg && (
                        <div className={`text-xs mt-2 flex items-start gap-1.5 ${state === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                          {state === 'error'
                            ? <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            : <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                          {msg}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => trigger(key)}
                      disabled={state === 'running'}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${state === 'running' ? 'animate-pulse text-amber-400' : ''}`} />
                      {state === 'running' ? 'Running…' : 'Run now'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Environment variables */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-white mb-2">Environment variables</h2>
          <p className="text-xs text-muted mb-4">Set these in <code className="bg-white/8 px-1.5 py-0.5 rounded text-amber-300">.env</code> — they cannot be changed here.</p>
          <div className="space-y-0">
            {[
              { key: 'ANTHROPIC_API_KEY', desc: 'Required for live AI draft generation' },
              { key: 'WHATSAPP_API_URL', desc: 'WhatsApp Business API endpoint (e.g. Meta Cloud API)' },
              { key: 'WHATSAPP_API_TOKEN', desc: 'WhatsApp Business API bearer token' },
              { key: 'WHATSAPP_FROM_NUMBER', desc: 'Your registered WhatsApp business number' },
              { key: 'JWT_SECRET', desc: 'Must be a long random string in production' },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                <div>
                  <code className="text-xs text-amber-300 font-mono">{key}</code>
                  <p className="text-[11px] text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
