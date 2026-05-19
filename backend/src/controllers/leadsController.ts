import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma/client'
import { LeadStatus, Prisma } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadWithDiscussions = Prisma.LeadGetPayload<{
  include: { discussions: true }
}>

interface FormattedLead {
  id: string
  name: string
  company: string | null
  phone: string | null
  status: LeadStatus
  createdAt: Date
  updatedAt: Date
  lastDiscussion: { note: string; createdAt: Date } | null
  nextFollowUp: Date | null
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatLead(lead: LeadWithDiscussions): FormattedLead {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Most recent discussion by createdAt
  const sorted = [...lead.discussions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const lastDiscussion = sorted[0]
    ? { note: sorted[0].note, createdAt: sorted[0].createdAt }
    : null

  // Earliest upcoming followUpAt (>= today)
  const upcomingFollowUps = lead.discussions
    .filter((d) => d.followUpAt && new Date(d.followUpAt) >= todayStart)
    .map((d) => d.followUpAt!)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const nextFollowUp = upcomingFollowUps[0] ?? null

  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    lastDiscussion,
    nextFollowUp,
  }
}

// ─── GET /api/leads ───────────────────────────────────────────────────────────
// Query: ?status=NEW|CONTACTED|... &search=string

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query

    const where: Prisma.LeadWhereInput = {}

    if (status) {
      if (!Object.values(LeadStatus).includes(status as LeadStatus)) {
        return res.status(400).json({ error: `Invalid status: ${status}` })
      }
      where.status = status as LeadStatus
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name:    { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        discussions: { orderBy: { createdAt: 'desc' } },
      },
    })

    return res.json(leads.map(formatLead))
  } catch (error) {
    return next(error)
  }
}

// ─── GET /api/leads/follow-ups/today ─────────────────────────────────────────
// Returns leads with today's follow-ups + overdue leads (not WON/LOST)

export const getFollowUpsToday = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [todayLeads, overdueLeads] = await Promise.all([
      // Discussions with followUpAt within today
      prisma.lead.findMany({
        where: {
          discussions: {
            some: { followUpAt: { gte: todayStart, lte: todayEnd } },
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: { discussions: { orderBy: { createdAt: 'desc' } } },
      }),

      // Overdue: followUpAt before today AND not closed
      prisma.lead.findMany({
        where: {
          status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
          discussions: {
            some: { followUpAt: { lt: todayStart } },
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: { discussions: { orderBy: { createdAt: 'desc' } } },
      }),
    ])

    // Deduplicate — a lead could appear in both if it has multiple follow-ups
    const todayIds = new Set(todayLeads.map((l) => l.id))
    const uniqueOverdue = overdueLeads.filter((l) => !todayIds.has(l.id))

    res.json({
      today:   todayLeads.map(formatLead),
      overdue: uniqueOverdue.map((l) => ({ ...formatLead(l), overdue: true })),
    })
  } catch (error) {
    next(error)
  }
}

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────
// Returns full lead with ALL discussions sorted by createdAt DESC

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        discussions: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    return res.json(lead)
  } catch (error) {
    return next(error)
  }
}

// ─── POST /api/leads ──────────────────────────────────────────────────────────
// Creates lead + auto-first discussion

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, company, phone } = req.body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' })
    }

    const lead = await prisma.lead.create({
      data: {
        name:    name.trim(),
        company: company?.trim() || undefined,
        phone:   phone?.trim()   || undefined,
        status:  LeadStatus.NEW,
        discussions: {
          create: {
            note:      'Lead created.',
            createdAt: new Date(),
          },
        },
      },
      include: {
        discussions: { orderBy: { createdAt: 'desc' } },
      },
    })

    return res.status(201).json(lead)
  } catch (error) {
    return next(error)
  }
}

// ─── PATCH /api/leads/:id/status ─────────────────────────────────────────────
// Updates only the status field

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body

    if (!status || !Object.values(LeadStatus).includes(status as LeadStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${Object.values(LeadStatus).join(', ')}`,
      })
    }

    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data:  { status: status as LeadStatus },
      include: { discussions: { orderBy: { createdAt: 'desc' } } },
    })

    return res.json(lead)
  } catch (error) {
    return next(error)
  }
}

// ─── POST /api/leads/:id/discussions ─────────────────────────────────────────
// Adds a discussion and touches lead updatedAt

export const addDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note, followUpAt } = req.body

    if (!note || typeof note !== 'string' || note.trim() === '') {
      return res.status(400).json({ error: 'note is required and must be a non-empty string' })
    }

    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    // Validate followUpAt if provided
    let parsedFollowUpAt: Date | undefined
    if (followUpAt) {
      parsedFollowUpAt = new Date(followUpAt)
      if (isNaN(parsedFollowUpAt.getTime())) {
        return res.status(400).json({ error: 'followUpAt must be a valid ISO datetime string' })
      }
    }

    // Create discussion + touch lead.updatedAt in a transaction
    const [discussion] = await prisma.$transaction([
      prisma.discussion.create({
        data: {
          leadId:    req.params.id,
          note:      note.trim(),
          followUpAt: parsedFollowUpAt,
        },
      }),
      prisma.lead.update({
        where: { id: req.params.id },
        data:  { updatedAt: new Date() },
      }),
    ])

    return res.status(201).json(discussion)
  } catch (error) {
    return next(error)
  }
}
