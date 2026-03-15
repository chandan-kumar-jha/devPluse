import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { mongo_Db_Connections } from './db/dbConnection'
import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";
import goalRoutes    from "./routes/goal.routes";
import skillRoutes   from "./routes/skill.routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import path from "path"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ─────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))  // limit body size
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(errorHandler);

// ── Health check ───────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DevPulse API running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/goals",    goalRoutes);
app.use("/api/skills",   skillRoutes);

// ── 404 handler ────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})


// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist")
  app.use(express.static(frontendPath))
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"))
  })
}



// ── Global error handler ───────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err.message)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ── Start server only after DB connects ───────────────────────────
const startServer = async (): Promise<void> => {
  await mongo_Db_Connections()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  })
}

startServer()

export default app