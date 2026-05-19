import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === 'development'

  // Log every unhandled error in dev
  if (isDev) {
    console.error('❌ Unhandled error:', err.message)
    console.error(err.stack)
  }

  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'A record with this value already exists' })
    return
  }

  // Prisma: record not found (update/delete on non-existent)
  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Record not found' })
    return
  }

  const statusCode = err.statusCode ?? 500
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    ...(isDev && statusCode === 500 && { detail: err.message, stack: err.stack }),
  })
}
