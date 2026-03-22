import './config/env'                                    // ← first, validates all vars
import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/dbConnection'
import { env } from './config/env'                      // ← import validated env

const app = express()
app.use(cors({
  origin: env.CLIENT_URL,                               // ← use env not process.env
  credentials: true,
}))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// ── Health check ───────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── Routes go here ─────────────────────────────────────────────────
// app.use('/auth', authRoutes)

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const startServer = async (): Promise<void> => {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`)
    console.log(`🌍 Environment: ${env.NODE_ENV}`)
  })
}

startServer()

export default app