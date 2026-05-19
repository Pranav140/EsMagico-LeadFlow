import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, CalendarDays } from 'lucide-react'
import { leadsApi } from '../api/leads'
import type { LeadStats } from '../types'

export const StatsBar = () => {
  const [stats, setStats] = useState<LeadStats | null>(null)

  useEffect(() => {
    leadsApi.getStats().then(setStats).catch(console.error)
  }, [])

  const wonCount = stats?.byStatus.find((s) => s.status === 'CLOSED_WON')?._count._all || 0
  const totalLeads = stats?.byStatus.reduce((acc, s) => acc + s._count._all, 0) || 0
  const revenue = stats?.totalRevenue || 0
  const newThisWeek = stats?.newThisWeek || 0

  const cards = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Deals Won',
      value: wonCount,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Revenue Won',
      value: `$${revenue.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'New This Week',
      value: newThisWeek,
      icon: CalendarDays,
      color: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-4`}
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">{label}</p>
            <p className="text-white text-xl font-bold mt-0.5">
              {stats ? value : <span className="w-12 h-5 bg-white/10 rounded animate-pulse inline-block" />}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
