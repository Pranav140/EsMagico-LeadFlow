import { getStatusColors, getStatusLabel } from '../utils/formatters'
import type { LeadStatus } from '../types'

interface BadgeProps {
  status: LeadStatus
}

export function StatusBadge({ status }: BadgeProps) {
  const { bg, text, border } = getStatusColors(status)
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
      aria-label={`Status: ${getStatusLabel(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}
