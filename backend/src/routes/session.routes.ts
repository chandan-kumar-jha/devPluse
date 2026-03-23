import { Router } from 'express'
import {
  createSession,
  listSessions,
  getSession,
  updateSession,
  deleteSession,
} from '../controllers/session.controller'
import authenticate from '../middleware/authenticate'
import validate from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { rateLimit } from 'express-rate-limit'
import {
  createSessionSchema,
  updateSessionSchema,
  listSessionsSchema,
} from '../schemas/session.schema'

// ── Session create rate limiter — 30 per hour ──────────────────────
const sessionCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many sessions logged. Try again in an hour.',
    })
  },
})

const router = Router()

// ── All session routes require authentication ──────────────────────
router.use(authenticate)

router.get('/',
  asyncHandler(listSessions)
)

router.post('/',
  sessionCreateLimiter,
  validate(createSessionSchema),
  asyncHandler(createSession)
)

router.get('/:id',
  asyncHandler(getSession)
)

router.patch('/:id',
  validate(updateSessionSchema),
  asyncHandler(updateSession)
)

router.delete('/:id',
  asyncHandler(deleteSession)
)

export default router