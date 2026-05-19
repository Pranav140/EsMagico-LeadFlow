import { useState, useEffect, useRef, useCallback } from 'react'
import { TrendingUp, Search, Plus, AlertCircle, RefreshCw, CalendarCheck } from 'lucide-react'
import { getLeads, getTodayFollowUps } from './api/leads'
import { LeadCard } from './components/LeadCard'
import { AddLeadModal } from './components/AddLeadModal'
import { LeadDetailModal } from './components/LeadDetailModal'
import type { Lead } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'ALL',           label: 'All' },
  { value: 'NEW',           label: 'New' },
  { value: 'CONTACTED',     label: 'Contacted' },
  { value: 'QUALIFIED',     label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'WON',           label: 'Won' },
  { value: 'LOST',          label: 'Lost' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeadSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded w-36" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-24" />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [leads, setLeads]               = useState<Lead[]>([])
  const [todayFollowUps, setTodayFollowUps] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [isLoading,    setIsLoading]    = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  const initialized   = useRef(false)
  const searchTimer   = useRef<ReturnType<typeof setTimeout>>()

  // ── Initial load (Promise.all) ───────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [leadsData, followUpsData] = await Promise.all([
        getLeads(),
        getTodayFollowUps(),
      ])
      setLeads(leadsData)
      setTodayFollowUps([
        ...followUpsData.overdue.map(l => ({ ...l, overdue: true as const })),
        ...followUpsData.today,
      ])
    } catch {
      setError('Could not load leads. Check your connection.')
    } finally {
      setIsLoading(false)
      initialized.current = true
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Filter + search (debounced 300ms for search, instant for filter) ─────────
  useEffect(() => {
    if (!initialized.current) return
    clearTimeout(searchTimer.current)
    const delay = searchQuery ? 300 : 0
    searchTimer.current = setTimeout(async () => {
      try {
        setError(null)
        const data = await getLeads(
          statusFilter !== 'ALL' ? statusFilter : undefined,
          searchQuery || undefined,
        )
        setLeads(data)
      } catch {
        setError('Could not load leads. Check your connection.')
      }
    }, delay)
    return () => clearTimeout(searchTimer.current)
  }, [statusFilter, searchQuery])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLeadAdded = useCallback((newLead: Lead) => {
    setLeads(prev => [newLead, ...prev])
    setIsAddModalOpen(false)
  }, [])

  const handleLeadUpdated = useCallback((updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? { ...updated } : l))
    setTodayFollowUps(prev =>
      prev.map(l => l.id === updated.id ? { ...updated, overdue: l.overdue } : l)
    )
  }, [])

  const showFollowUps = statusFilter === 'ALL' && !searchQuery

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <TrendingUp size={26} strokeWidth={2.5} aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight">LeadFlow</h1>
          </div>
          <button
            id="open-add-lead"
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Add new lead"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
              px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={17} aria-hidden="true" />
            Add New Lead
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── FILTERS + SEARCH ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Status filters">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">
              Filters:
            </span>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={statusFilter === f.value}
                aria-label={`Filter: ${f.label}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === f.value
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search leads by name or company"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* ── ERROR BANNER ────────────────────────────────────────────────────── */}
        {error && !isLoading && (
          <div
            role="alert"
            className="mb-8 flex items-center justify-between gap-4 px-5 py-4
              bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={17} aria-hidden="true" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={loadAll}
              aria-label="Retry loading leads"
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-red-900 transition-colors"
            >
              <RefreshCw size={14} aria-hidden="true" /> Retry
            </button>
          </div>
        )}

        {/* ── TODAY'S FOLLOW-UPS ──────────────────────────────────────────────── */}
        {showFollowUps && (
          <section className="mb-12" aria-label="Today's follow-ups">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
              <span aria-hidden="true">🚀</span> Today's Follow-Ups
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1].map(i => <LeadSkeleton key={i} />)}
              </div>
            ) : todayFollowUps.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-100 rounded-xl text-green-700">
                <CalendarCheck size={18} aria-hidden="true" />
                <span className="text-sm font-medium">No follow-ups scheduled for today 🎉</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayFollowUps.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isFollowUp
                    onClick={l => setSelectedLeadId(l.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── ALL LEADS ───────────────────────────────────────────────────────── */}
        <section aria-label="All leads">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
            {statusFilter === 'ALL' ? 'All Leads' : `${FILTERS.find(f => f.value === statusFilter)?.label} Leads`}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => <LeadSkeleton key={i} />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400
              border-2 border-dashed border-slate-200 rounded-2xl">
              <span className="text-4xl mb-3" aria-hidden="true">🔍</span>
              <p className="text-sm font-medium">No leads found for this filter.</p>
              {(statusFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => { setStatusFilter('ALL'); setSearchQuery('') }}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={l => setSelectedLeadId(l.id)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  )
}
