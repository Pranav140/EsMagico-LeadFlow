import { Router } from 'express'
import {
  getLeads,
  getFollowUpsToday,
  getLeadById,
  createLead,
  updateLeadStatus,
  addDiscussion,
} from '../controllers/leadsController'

const router = Router()

// ─── Follow-ups MUST be before /:id to avoid route conflict ──────────────────
router.get('/follow-ups/today', getFollowUpsToday)

// ─── Lead CRUD ────────────────────────────────────────────────────────────────
router.get('/',    getLeads)
router.post('/',   createLead)
router.get('/:id', getLeadById)

// ─── Status update ────────────────────────────────────────────────────────────
router.patch('/:id/status', updateLeadStatus)

// ─── Discussions ──────────────────────────────────────────────────────────────
router.post('/:id/discussions', addDiscussion)

export { router as leadRoutes }
