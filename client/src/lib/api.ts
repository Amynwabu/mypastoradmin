const BASE = '/api'

function getToken() {
  return localStorage.getItem('mpa_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('mpa_token')
    localStorage.removeItem('mpa_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const put = <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
const patch = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' })

export const auth = {
  login: (email: string, password: string) => post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => get<User>('/auth/me'),
}

export const members = {
  list: (params?: Record<string, string>) => get<Member[]>(`/members${params ? '?' + new URLSearchParams(params) : ''}`),
  get: (id: string) => get<Member>(`/members/${id}`),
  create: (data: Partial<Member>) => post<Member>('/members', data),
  update: (id: string, data: Partial<Member>) => put<Member>(`/members/${id}`, data),
  delete: (id: string) => del<{ success: boolean }>(`/members/${id}`),
  import: (rows: Partial<Member>[]) => post<{ imported: number; members: Member[] }>('/members/import', { members: rows }),
}

export const events = {
  list: () => get<ChurchEvent[]>('/events'),
  create: (data: Partial<ChurchEvent>) => post<ChurchEvent>('/events', data),
  update: (id: string, data: Partial<ChurchEvent>) => put<ChurchEvent>(`/events/${id}`, data),
  delete: (id: string) => del<{ success: boolean }>(`/events/${id}`),
}

export const prayer = {
  list: () => get<PrayerSession[]>('/prayer'),
  create: (data: Partial<PrayerSession>) => post<PrayerSession>('/prayer', data),
  update: (id: string, data: Partial<PrayerSession>) => put<PrayerSession>(`/prayer/${id}`, data),
  generate: () => post<{ generated: number; sessions: PrayerSession[] }>('/prayer/generate', {}),
}

export const care = {
  list: () => get<CareRequest[]>('/care'),
  create: (data: Partial<CareRequest>) => post<CareRequest>('/care', data),
  update: (id: string, data: Partial<CareRequest>) => put<CareRequest>(`/care/${id}`, data),
}

export const finance = {
  list: () => get<Transaction[]>('/finance'),
  create: (data: Partial<Transaction>) => post<Transaction>('/finance', data),
}

export const evangelism = {
  list: () => get<EvangelismContact[]>('/evangelism'),
  create: (data: Partial<EvangelismContact>) => post<EvangelismContact>('/evangelism', data),
  update: (id: string, data: Partial<EvangelismContact>) => put<EvangelismContact>(`/evangelism/${id}`, data),
}

export const ai = {
  draft: (type: string, context?: Record<string, string>) => post<{ draft: string; provider: string }>('/ai/draft', { type, context }),
}

export const messages = {
  list: () => get<Message[]>('/messages'),
  approve: (id: string) => patch<Message>(`/messages/${id}/approve`),
}

export const analytics = {
  summary: () => get<AnalyticsSummary>('/analytics'),
}

export const settings = {
  get: () => get<AppSettings>('/settings'),
  save: (data: Partial<AppSettings>) => put<AppSettings>('/settings', data),
}

// Types
export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface Member {
  id: string
  name: string
  firstName: string
  phone: string
  whatsapp: string
  birthday: string
  department: string
  dedicationLevel: string
  active: boolean
  joinDate: string
  notes: string
  createdAt: string
}

export interface ChurchEvent {
  id: string
  name: string
  date: string
  time: string
  location: string
  description: string
  targetGroup: string
  createdAt: string
}

export interface PrayerSession {
  id: string
  date: string
  session: string
  time: string
  ministerIds: string[]
  ministerNames: string[]
  status: string
  type: string
  notes: string
}

export interface CareRequest {
  id: string
  name: string
  summary: string
  status: string
  assignedTo: string
  createdAt: string
}

export interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  amount: number
  currency: string
  description: string
  createdAt: string
}

export interface EvangelismContact {
  id: string
  name: string
  phone: string
  interest: string
  status: string
  eventName: string
  notes: string
  createdAt: string
}

export interface Message {
  id: string
  type: string
  recipient: string
  recipientPhone?: string
  content: string
  status: string
  approvedBy?: string
  approvedAt?: string
  sentAt?: string
  sentTo?: string
  sentBy?: string
  whatsappSid?: string
  sendError?: string
  broadcastCount?: number
  createdAt: string
}

export interface AnalyticsSummary {
  totals: {
    members: number
    events: number
    prayerSessions: number
    drafts: number
    openCareRequests: number
    evangelismContacts: number
  }
  byDepartment: Record<string, number>
  byDedication: Record<string, number>
  upcomingEvents: ChurchEvent[]
  recentMembers: Member[]
}

export interface AppSettings {
  fellowshipName: string
  pastorName: string
  timezone: string
}
