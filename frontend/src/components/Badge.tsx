import type { LeadStatus } from '../types'

interface BadgeProps {
  status: LeadStatus
}

export function StatusBadge({ status }: BadgeProps) {
  const colors: Record<LeadStatus, string> = {
    NEW: 'bg-green-100 text-green-800 border-green-200',
    CONTACTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    QUALIFIED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROPOSAL_SENT: 'bg-purple-100 text-purple-800 border-purple-200',
    WON: 'bg-gray-100 text-gray-800 border-gray-200',
    LOST: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
