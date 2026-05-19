import { useState } from 'react'
import { TrendingUp, Search, Plus } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import { LeadCard } from './components/LeadCard'
import type { Lead } from './types'

// Mock Modals (Full implementation later)
const AddLeadModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl min-w-[400px]">
      <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
      <p className="text-slate-500 mb-6">Modal placeholder...</p>
      <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
    </div>
  </div>
)

const LeadDetailModal = ({ lead, onClose }: { lead: Lead; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl min-w-[500px]">
      <h2 className="text-xl font-bold mb-4">{lead.name} Details</h2>
      <p className="text-slate-500 mb-6">Modal placeholder...</p>
      <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
    </div>
  </div>
)

const FILTERS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST']

export default function App() {
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const { leads, followUps, loading, error } = useLeads(activeFilter, searchTerm)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <TrendingUp size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight">LeadFlow</h1>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add New Lead
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* FILTERS & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 mr-2 tracking-wider">FILTERS:</span>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeFilter === f 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            Error loading data: {error}
          </div>
        )}

        {/* TODAY'S FOLLOW-UPS */}
        {(!searchTerm && activeFilter === 'ALL' && (followUps.today.length > 0 || followUps.overdue.length > 0)) && (
          <section className="mb-12">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span>🚀</span> TODAY'S FOLLOW-UPS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followUps.overdue.map(lead => (
                <LeadCard key={lead.id} lead={lead} isFollowUp onClick={setSelectedLead} />
              ))}
              {followUps.today.map(lead => (
                <LeadCard key={lead.id} lead={lead} isFollowUp onClick={setSelectedLead} />
              ))}
            </div>
          </section>
        )}

        {/* ALL LEADS */}
        <section>
          <h2 className="text-lg font-bold mb-4">
            {activeFilter === 'ALL' ? 'ALL LEADS' : `${activeFilter.replace('_', ' ')} LEADS`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12 text-slate-400">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
              No leads found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODALS */}
      {isAddModalOpen && <AddLeadModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}

    </div>
  )
}
