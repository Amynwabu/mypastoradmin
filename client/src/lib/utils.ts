import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
}

export function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export const DEPARTMENTS = ['General', 'Leaders', 'Prayer', 'Choir', 'Admin', 'Protocol', 'Media', 'Finance', 'Evangelism', 'Hospitality', 'Follow-up']
export const DEDICATION_LEVELS = ['Regular', 'Active', 'Core', 'Irregular']
