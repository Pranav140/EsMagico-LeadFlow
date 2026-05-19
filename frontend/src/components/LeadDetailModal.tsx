import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Phone, ChevronDown, Check, Loader2, Calendar, RefreshCw } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { getLeadById, updateLeadStatus, addDiscussion } from '../api/leads'
import { StatusBadge } from './Badge'
import type { Lead, LeadStatus } from '../types'

interface LeadDetailModalProps {
  leadId: string | null
  onClose: () => void
  onLeadUpdated: (lead: Lead) => void
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
]

function DiscussionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-slate-200 mt-0.5" />
            {i < 2 && <div className="w-px bg-slate-100 flex-1 mt-1 min-h-[60px]" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="h-3 bg-slate-200 rounded w-36 mb-3" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LeadDetailModal({ leadId, onClose, onLeadUpdated }: LeadDetailModalProps) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [noteText, setNoteText] = useState('')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState('09:00')
  const [savingNote, setSavingNote] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const isOpen = leadId !== null

  // ── Fetch lead ──────────────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getLeadById(leadId)
      setLead(data)
    } catch {
      setFetchError('Failed to load lead details.')
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    if (leadId) {
      fetchLead()
    } else {
      setLead(null)
      setNoteText('')
      setShowFollowUp(false)
      setFollowUpDate('')
      setFollowUpTime('09:00')
      setNoteError(null)
      setDropdownOpen(false)
    }
  }, [leadId, fetchLead])

  // ── ESC + body scroll ───────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (dropdownOpen) setDropdownOpen(false)
      else onClose()
    }
  }, [dropdownOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // ── Click outside dropdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // ── Status change (optimistic) ──────────────────────────────────────────────
  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || updatingStatus) return
    setDropdownOpen(false)
    const prev = lead.status
    setLead(l => l ? { ...l, status: newStatus } : l)
    setUpdatingStatus(true)
    try {
      const updated = await updateLeadStatus(lead.id, newStatus)
      setLead(l => l ? { ...l, status: updated.status } : l)
      onLeadUpdated(updated)
    } catch {
      setLead(l => l ? { ...l, status: prev } : l)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // ── Save note ───────────────────────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!lead || !noteText.trim() || savingNote) return
    setSavingNote(true)
    setNoteError(null)

    const followUpISO =
      showFollowUp && followUpDate
        ? new Date(`${followUpDate}T${followUpTime || '09:00'}`).toISOString()
        : undefined

    try {
      const newDisc = await addDiscussion(lead.id, { note: noteText.trim(), followUpAt: followUpISO })
      setLead(l => l ? { ...l, discussions: [newDisc, ...(l.discussions ?? [])] } : l)
      setNoteText('')
      setShowFollowUp(false)
      setFollowUpDate('')
      setFollowUpTime('09:00')
    } catch {
      setNoteError('Failed to save note. Please try again.')
    } finally {
      setSavingNote(false)
    }
  }

  if (!isOpen) return null

  const discussions = lead?.discussions ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[640px] flex flex-col"
        style={{ maxHeight: '82vh' }}
        role="dialog"
        aria-modal="true"
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {loading && !lead ? (
                <div className="h-6 w-52 bg-slate-200 rounded animate-pulse mb-2" />
              ) : (
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {lead?.name}
                  {lead?.company && (
                    <span className="text-slate-400 font-normal ml-2 text-base">({lead.company})</span>
                  )}
                </h2>
              )}
              {lead?.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                  <Phone size={13} />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  disabled={!lead || updatingStatus}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
                    hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {lead && <StatusBadge status={lead.status} />}
                  {updatingStatus
                    ? <Loader2 size={13} className="animate-spin text-slate-400 ml-1" />
                    : <ChevronDown size={13} className="text-slate-400 ml-0.5" />
                  }
                </button>

                {dropdownOpen && lead && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl
                    border border-slate-100 py-1 z-20">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm
                          text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span>{opt.label}</span>
                        {lead.status === opt.value && <Check size={14} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Timeline */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Discussion History
            </h3>

            {loading ? (
              <DiscussionSkeleton />
            ) : fetchError ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500 mb-4">{fetchError}</p>
                <button
                  onClick={fetchLead}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200
                    text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            ) : discussions.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-2">No discussions yet. Add the first note below.</p>
            ) : (
              <div>
                {discussions.map((d, i) => (
                  <div key={d.id} className="flex gap-4">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-0.5 ring-2 border-2 border-white flex-shrink-0 ${
                        i === 0 ? 'bg-blue-500 ring-blue-200' : 'bg-slate-300 ring-slate-100'
                      }`} />
                      {i < discussions.length - 1 && (
                        <div className="w-px bg-slate-200 flex-1 mt-1.5 mb-1.5 min-h-[20px]" />
                      )}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 ${i < discussions.length - 1 ? 'pb-5' : 'pb-2'}`}>
                      <p className="text-xs text-slate-400 font-medium mb-2 leading-none">
                        {format(new Date(d.createdAt), 'MMM d, h:mm a')}
                        <span className="ml-1">
                          ({formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })})
                        </span>
                      </p>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{d.note}</p>
                        {d.followUpAt && (
                          <p className="mt-2.5 text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Follow-up set for: {format(new Date(d.followUpAt), 'MMM d, yyyy · h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note */}
          <div className="px-6 pb-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Add Note
            </h3>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Log a new discussion..."
              rows={3}
              disabled={savingNote || !lead}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20
                focus:border-blue-500 transition-all disabled:opacity-60"
            />

            {/* Follow-up toggle */}
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={showFollowUp}
                  onChange={(e) => setShowFollowUp(e.target.checked)}
                  disabled={savingNote || !lead}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Set Follow-up
              </label>

              {showFollowUp && (
                <div className="flex gap-3 mt-3">
                  <input
                    type="date"
                    value={followUpDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    disabled={savingNote}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      transition-all disabled:opacity-60"
                  />
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    disabled={savingNote}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      transition-all disabled:opacity-60"
                  />
                </div>
              )}
            </div>

            {noteError && (
              <p className="mt-2 text-sm text-red-500 font-medium">{noteError}</p>
            )}

            <button
              onClick={handleSaveNote}
              disabled={!noteText.trim() || savingNote || !lead}
              className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingNote
                ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : 'Save Note'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
