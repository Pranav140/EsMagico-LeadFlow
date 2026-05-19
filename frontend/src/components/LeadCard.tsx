import { formatTimeAgo, formatFollowUpTime, isOverdue } from '../utils/formatters'
import { StatusBadge } from './Badge'
import type { Lead } from '../types'

interface LeadCardProps {
  lead: Lead
  isFollowUp?: boolean
  onClick: (lead: Lead) => void
}

export function LeadCard({ lead, isFollowUp, onClick }: LeadCardProps) {
  const isWon  = lead.status === 'WON'
  const isLost = lead.status === 'LOST'
  const overdue = lead.overdue || isOverdue(lead.nextFollowUp)

  let cardClass =
    'relative p-4 rounded-xl border bg-white hover:shadow-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 '

  if (isFollowUp) {
    cardClass += overdue
      ? 'border-slate-200 border-l-4 border-l-red-500 bg-red-50/20 '
      : 'border-slate-200 border-l-4 border-l-blue-400 bg-blue-50/20 '
  } else if (isLost) {
    cardClass += 'border-slate-100 opacity-50 '
  } else if (isWon) {
    cardClass += 'border-slate-200 opacity-75 bg-slate-50 '
  } else {
    cardClass += 'border-slate-200 '
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cardClass}
      onClick={() => onClick(lead)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(lead) }}
      aria-label={`Lead: ${lead.name}${lead.company ? `, ${lead.company}` : ''}, status ${lead.status}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`font-semibold text-slate-900 leading-tight ${isLost ? 'line-through text-slate-400' : ''}`}>
          {lead.name}
          {lead.company && (
            <span className="font-normal text-slate-400 ml-1.5">({lead.company})</span>
          )}
        </h3>
        <StatusBadge status={lead.status} />
      </div>

      {/* Follow-up row */}
      {isFollowUp && lead.nextFollowUp && (
        <div className="mt-2">
          {overdue ? (
            <p className="text-sm font-semibold text-red-600 flex items-center gap-1">
              ⚠️ OVERDUE — {formatTimeAgo(lead.nextFollowUp)}
            </p>
          ) : (
            <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
              🔔 Follow-up today at {formatFollowUpTime(lead.nextFollowUp)}
            </p>
          )}
        </div>
      )}

      {/* Last discussion row */}
      {!isFollowUp && (
        <div className="mt-2">
          {lead.lastDiscussion ? (
            <>
              <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                {lead.lastDiscussion.note}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatTimeAgo(lead.lastDiscussion.createdAt)}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">No notes yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
