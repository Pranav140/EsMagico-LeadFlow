import { useState, useEffect } from 'react'
import { getLeads, getTodayFollowUps } from '../api/leads'
import type { Lead, FollowUpsResponse } from '../types'

export function useLeads(status: string, search: string) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [followUps, setFollowUps] = useState<FollowUpsResponse>({ today: [], overdue: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [leadsData, followUpsData] = await Promise.all([
        getLeads(status, search),
        getTodayFollowUps()
      ])
      setLeads(leadsData)
      setFollowUps(followUpsData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchAll()
    }, search ? 300 : 0)

    return () => clearTimeout(timer)
  }, [status, search])

  return { leads, followUps, loading, error, refetch: fetchAll }
}
