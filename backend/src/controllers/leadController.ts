import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma/client'
import { LeadStatus, LeadPriority } from '@prisma/client'

// GET /api/leads
export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: Record<string, unknown> = {}

    if (status) where.status = status as LeadStatus
    if (priority) where.priority = priority as LeadPriority
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          _count: { select: { activities: true } },
        },
      }),
      prisma.lead.count({ where }),
    ])

    res.json({
      data: leads,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/leads/:id
export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
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

// POST /api/leads
export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName, lastName, email, phone, company, jobTitle,
      status, priority, source, value, notes, assignedTo, tags,
    } = req.body

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName, and email are required' })
    }

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        status: status || LeadStatus.NEW,
        priority: priority || LeadPriority.MEDIUM,
        source,
        value: value ? parseFloat(value) : undefined,
        notes,
        assignedTo,
        tags: tags || [],
      },
    })

    return res.status(201).json(lead)
  } catch (error) {
    return next(error)
  }
}

// PATCH /api/leads/:id
export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        value: req.body.value !== undefined ? parseFloat(req.body.value) : undefined,
      },
    })

    return res.json(lead)
  } catch (error) {
    return next(error)
  }
}

// DELETE /api/leads/:id
export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    await prisma.lead.delete({ where: { id: req.params.id } })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

// GET /api/leads/stats
export const getLeadStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [statusCounts, priorityCounts, totalValue, recentLeads] = await Promise.all([
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ['priority'],
        _count: { _all: true },
      }),
      prisma.lead.aggregate({
        _sum: { value: true },
        where: { status: LeadStatus.CLOSED_WON },
      }),
      prisma.lead.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    res.json({
      byStatus: statusCounts,
      byPriority: priorityCounts,
      totalRevenue: totalValue._sum.value || 0,
      newThisWeek: recentLeads,
    })
  } catch (error) {
    next(error)
  }
}
