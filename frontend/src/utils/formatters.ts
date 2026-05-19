import { formatDistanceToNow, format, isToday, isBefore, startOfDay } from 'date-fns'
import type { LeadStatus } from '../types'

export function formatTimeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatFollowUpTime(date: string): string {
  return format(new Date(date), 'MMM d, h:mm a')
}

export function getStatusLabel(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    PROPOSAL_SENT: 'Proposal Sent',
    WON: 'Won',
    LOST: 'Lost',
  }
  return labels[status]
}

export function getStatusColors(status: LeadStatus): { bg: string; text: string; border: string } {
  const map: Record<LeadStatus, { bg: string; text: string; border: string }> = {
    NEW:           { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
    CONTACTED:     { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    QUALIFIED:     { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200' },
    PROPOSAL_SENT: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    WON:           { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200' },
    LOST:          { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200' },
  }
  return map[status]
}

export function isOverdue(followUpAt: string | null): boolean {
  if (!followUpAt) return false
  return isBefore(new Date(followUpAt), startOfDay(new Date()))
}

export function isTodayFollowUp(followUpAt: string | null): boolean {
  if (!followUpAt) return false
  return isToday(new Date(followUpAt))
}
