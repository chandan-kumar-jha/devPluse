import './config/env'
import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/dbConnection'
import { env } from './config/env'
import authRoutes from './routes/auth.routes'
import settingsRoutes from './routes/settings.routes'
import profileRoutes from './routes/profile.routes'
import errorHandler from './middleware/errorHandler'    // ← missing
import { requestId } from './middleware/requestId'
import goalRoutes from './routes/goal.routes'
import sessionRoutes from './routes/session.routes'
import skillRoutes from './routes/skill.routes'
import notificationRoutes from './routes/notification.routes'
import dashboardRoutes from './routes/dashboard.routes'

const app = express()

app.use(requestId)
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── Routes ────────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/sessions', sessionRoutes)
app.use('/goals', goalRoutes)
app.use('/skills', skillRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/notifications', notificationRoutes) 
app.use('/settings', settingsRoutes)

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Error handler — must be last ──────────────────────────────────
app.use(errorHandler)                                   // ← must be after routes

const startServer = async (): Promise<void> => {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`)
    console.log(`🌍 Environment: ${env.NODE_ENV}`)
  })
}

startServer()

export default app