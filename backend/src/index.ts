import dotenv from 'dotenv'
dotenv.config()

import app from './app'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 LeadFlow API running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] ?? 'not set'}`)
})
