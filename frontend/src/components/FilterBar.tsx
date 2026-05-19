import { Search, Filter, ChevronDown, RotateCcw } from 'lucide-react'
import type { LeadFilters, LeadStatus, LeadPriority } from '../types'

interface FilterBarProps {
  filters: LeadFilters
  onFilterChange: (filters: Partial<LeadFilters>) => void
}

const STATUSES: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Won' },
  { value: 'CLOSED_LOST', label: 'Lost' },
]

const PRIORITIES: { value: LeadPriority | ''; label: string }[] = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const hasActiveFilters = filters.status || filters.priority || filters.search

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search leads by name, email, or company..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value as LeadStatus | '' })}
          className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[150px]"
        >
          {STATUSES.map(({ value, label }) => (
            <option key={value} value={value} className="bg-slate-800">{label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>

      {/* Priority Filter */}
      <div className="relative">
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange({ priority: e.target.value as LeadPriority | '' })}
          className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 pr-8 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[150px]"
        >
          {PRIORITIES.map(({ value, label }) => (
            <option key={value} value={value} className="bg-slate-800">{label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => onFilterChange({ search: '', status: '', priority: '' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      )}
    </div>
  )
}
