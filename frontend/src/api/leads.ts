import axios from 'axios'
import type { Lead, Discussion, LeadStatus, FollowUpsResponse } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export const getLeads = async (status?: string, search?: string): Promise<Lead[]> => {
  const params = new URLSearchParams()
  if (status && status !== 'ALL') params.append('status', status)
  if (search) params.append('search', search)
  
  const { data } = await api.get<Lead[]>(`/leads?${params.toString()}`)
  return data
}

export const getTodayFollowUps = async (): Promise<FollowUpsResponse> => {
  const { data } = await api.get<FollowUpsResponse>('/leads/follow-ups/today')
  return data
}

export const getLeadById = async (id: string): Promise<Lead> => {
  const { data } = await api.get<Lead>(`/leads/${id}`)
  return data
}

export const createLead = async (leadData: { name: string; company?: string; phone?: string }): Promise<Lead> => {
  const { data } = await api.post<Lead>('/leads', leadData)
  return data
}

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead> => {
  const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status })
  return data
}

export const addDiscussion = async (leadId: string, discussionData: { note: string; followUpAt?: string }): Promise<Discussion> => {
  const { data } = await api.post<Discussion>(`/leads/${leadId}/discussions`, discussionData)
  return data
}
