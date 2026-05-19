export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST'

export interface Discussion {
  id: string
  note: string
  followUpAt: string | null
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  company: string | null
  phone: string | null
  status: LeadStatus
  createdAt: string
  updatedAt: string
  lastDiscussion: { note: string; createdAt: string } | null
  nextFollowUp: string | null
  discussions?: Discussion[]
  overdue?: boolean // Added for follow-ups endpoint
}

export interface FollowUpsResponse {
  today: Lead[]
  overdue: Lead[]
}
