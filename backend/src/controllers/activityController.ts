import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma/client'

// GET /api/activities?leadId=xxx
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, type } = req.query

    const where: Record<string, unknown> = {}
    if (leadId) where.leadId = leadId as string
    if (type) where.type = type as string

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    res.json(activities)
  } catch (error) {
    next(error)
  }
}

// POST /api/activities
export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, type, title, description, scheduledAt, completedAt } = req.body

    if (!leadId || !type || !title) {
      return res.status(400).json({ error: 'leadId, type, and title are required' })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    const activity = await prisma.activity.create({
      data: {
        leadId,
        type,
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return res.status(201).json(activity)
  } catch (error) {
    return next(error)
  }
}

// PATCH /api/activities/:id
export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.activity.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
      },
    })

    return res.json(activity)
  } catch (error) {
    return next(error)
  }
}

// DELETE /api/activities/:id
export const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.activity.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    await prisma.activity.delete({ where: { id: req.params.id } })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}
