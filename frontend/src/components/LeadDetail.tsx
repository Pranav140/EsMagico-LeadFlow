import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Phone, Mail, Zap, FileText, CheckSquare, Video, Plus } from 'lucide-react'
import { useLead } from '../hooks/useLeads'
import { activitiesApi } from '../api/leads'
import { StatusBadge, PriorityBadge } from './Badge'
import type { Activity, ActivityType } from '../types'

interface LeadDetailProps {
  leadId: string
  onClose: () => void
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Video,
  NOTE: FileText,
  TASK: CheckSquare,
}

const activityColors: Record<ActivityType, string> = {
  CALL: 'text-emerald-400 bg-emerald-500/20',
  EMAIL: 'text-blue-400 bg-blue-500/20',
  MEETING: 'text-purple-400 bg-purple-500/20',
  NOTE: 'text-amber-400 bg-amber-500/20',
  TASK: 'text-cyan-400 bg-cyan-500/20',
}

export const LeadDetail = ({ leadId, onClose }: LeadDetailProps) => {
  const { lead, loading, refetch } = useLead(leadId)
  const [addingActivity, setAddingActivity] = useState(false)
  const [activityForm, setActivityForm] = useState({
    type: 'NOTE' as ActivityType,
    title: '',
    description: '',
  })
  const [savingActivity, setSavingActivity] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityForm.title) return

    setSavingActivity(true)
    try {
      await activitiesApi.create({
        leadId,
        ...activityForm,
        completedAt: new Date().toISOString(),
      })
      setActivityForm({ type: 'NOTE', title: '', description: '' })
      setAddingActivity(false)
      refetch()
    } finally {
      setSavingActivity(false)
    }
  }

  if (loading || !lead) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = `${lead.firstName[0]}${lead.lastName[0]}`.toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-white/10 w-full max-w-lg h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {lead.firstName} {lead.lastName}
              </h2>
              {lead.jobTitle && lead.company && (
                <p className="text-slate-400 text-sm">{lead.jobTitle} at {lead.company}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Email', value: lead.email },
              { label: 'Phone', value: lead.phone },
              { label: 'Company', value: lead.company },
              { label: 'Source', value: lead.source },
              { label: 'Assigned To', value: lead.assignedTo },
              {
                label: 'Deal Value',
                value: lead.value ? `$${lead.value.toLocaleString()}` : undefined,
              },
            ].map(({ label, value }) =>
              value ? (
                <div key={label}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              ) : null
            )}
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-slate-300 text-sm leading-relaxed bg-white/5 rounded-lg p-3">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Activities ({lead.activities?.length || 0})
              </p>
              <button
                onClick={() => setAddingActivity(!addingActivity)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus size={13} />
                Add
              </button>
            </div>

            {/* Add Activity Form */}
            {addingActivity && (
              <form onSubmit={handleAddActivity} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm((p) => ({ ...p, type: e.target.value as ActivityType }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK'] as ActivityType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={activityForm.title}
                  onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Activity title..."
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddingActivity(false)}
                    className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingActivity}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {savingActivity ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            {/* Activity List */}
            <div className="space-y-3">
              {(lead.activities || []).map((activity: Activity) => {
                const Icon = activityIcons[activity.type]
                const colorClass = activityColors[activity.type]
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      {activity.description && (
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{activity.description}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {format(new Date(activity.createdAt), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                )
              })}
              {(!lead.activities || lead.activities.length === 0) && (
                <div className="text-center py-8">
                  <Zap size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No activities yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-white/10 text-xs text-slate-600 space-y-1">
            <p>Created: {format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a')}</p>
            <p>Updated: {format(new Date(lead.updatedAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
