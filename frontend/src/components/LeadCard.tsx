import { formatDistanceToNow, format } from 'date-fns'
import { StatusBadge } from './Badge'
import type { Lead } from '../types'

interface LeadCardProps {
  lead: Lead
  isFollowUp?: boolean
  onClick: (lead: Lead) => void
}

export function LeadCard({ lead, isFollowUp, onClick }: LeadCardProps) {
  const isWon = lead.status === 'WON'
  const isLost = lead.status === 'LOST'
  const isOverdue = lead.overdue

  // Styling logic
  let cardClass = "relative p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer "
  
  if (isFollowUp) {
    cardClass += isOverdue 
      ? "bg-red-50/30 border-l-4 border-l-red-500 " 
      : "bg-blue-50/30 border-l-4 border-l-blue-500 "
  } else if (isWon) {
    cardClass += "opacity-75 bg-slate-50 "
  } else if (isLost) {
    cardClass += "opacity-50 bg-slate-50 "
  }

  return (
    <div className={cardClass} onClick={() => onClick(lead)}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`font-semibold text-slate-900 ${isLost ? 'line-through text-slate-500' : ''}`}>
            {lead.name} <span className="font-normal text-slate-500">({lead.company || 'No Company'})</span>
          </h3>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {isFollowUp ? (
        <div className="mt-3">
          {isOverdue ? (
            <p className="text-sm font-medium text-red-600 flex items-center gap-1">
              ⚠️ Overdue since {lead.nextFollowUp ? formatDistanceToNow(new Date(lead.nextFollowUp), { addSuffix: true }) : ''}
            </p>
          ) : (
            <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
              🗓️ Follow-up today at {lead.nextFollowUp ? format(new Date(lead.nextFollowUp), 'h:mm a') : 'Any time'}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {lead.lastDiscussion ? (
            <div>
              <p className="text-sm text-slate-600 line-clamp-2">{lead.lastDiscussion.note}</p>
              <p className="text-xs text-slate-400 mt-1">
                {formatDistanceToNow(new Date(lead.lastDiscussion.createdAt), { addSuffix: true })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No notes yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
