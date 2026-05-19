import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { leadRoutes } from './routes/leads'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

dotenv.config()

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LeadFlow API' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/leads', leadRoutes)

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

export default app
