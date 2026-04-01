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
import errorHandler from './middleware/errorHandler'    
import { requestId } from './middleware/requestId'
import goalRoutes from './routes/goal.routes'
import sessionRoutes from './routes/session.routes'
import skillRoutes from './routes/skill.routes'
import notificationRoutes from './routes/notification.routes'
import dashboardRoutes from './routes/dashboard.routes'
import path from "path";

const app = express()

app.use(requestId)

const allowedOrigins = [
  'https://devpluse.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

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

// ── API Routes ────────────────────────────────────────────────────
// Note: If you add "/api" prefix here, it makes routing much safer
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/sessions', sessionRoutes)
app.use('/goals', goalRoutes)
app.use('/skills', skillRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/notifications', notificationRoutes) 
app.use('/settings', settingsRoutes)

// ── Production Frontend Logic ─────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  // Path to your frontend build folder
  const frontendPath = path.resolve(process.cwd(), "..", "frontend", "dist");
  
  console.log("Serving frontend from:", frontendPath); // Log this to verify!

  // 1. Serve static files
  app.use(express.static(frontendPath));

  /**
   * CATCH-ALL ROUTE
   * This is the "magic fix" for mobile refreshes. 
   * It tells Express: "If it's not a health check or an API route, 
   * just give them the React app and let React Router handle the URL."
   */
 app.use((req: Request, res: Response, next) => {
    // If the request is a GET and not looking for an API route
    if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.startsWith('/health')) {
      return res.sendFile(path.join(frontendPath, "index.html"));
    }
    next();
  });

} else {
  // 404 handler for development only
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });
}

// ── Error handler — MUST BE LAST ──────────────────────────────────
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB()
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

startServer()

export default app