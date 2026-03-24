import { Router } from 'express'
import {
  createGoal,
  listGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  archiveGoal,
  togglePin,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} from '../controllers/goal.controller'
import authenticate from '../middleware/authenticate'
import validate from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { rateLimit } from 'express-rate-limit'
import {
  createGoalSchema,
  updateGoalSchema,
  addMilestoneSchema,
  listGoalsSchema,
} from '../schemas/goal.schema'

// ── Goal create rate limiter — 20 per hour ─────────────────────────
const goalCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many goals created. Try again in an hour.',
    })
  },
})

const router = Router()

// ── All goal routes require authentication ─────────────────────────
router.use(authenticate)

router.get('/',
  asyncHandler(listGoals)
)

router.post('/',
  goalCreateLimiter,
  validate(createGoalSchema),
  asyncHandler(createGoal)
)

router.get('/:id',
  asyncHandler(getGoal)
)

router.patch('/:id',
  validate(updateGoalSchema),
  asyncHandler(updateGoal)
)

router.delete('/:id',
  asyncHandler(deleteGoal)
)

router.patch('/:id/archive',
  asyncHandler(archiveGoal)
)

router.patch('/:id/pin',
  asyncHandler(togglePin)
)

router.post('/:id/milestones',
  validate(addMilestoneSchema),
  asyncHandler(addMilestone)
)

router.patch('/:id/milestones/:mid',
  asyncHandler(toggleMilestone)
)

router.delete('/:id/milestones/:mid',
  asyncHandler(deleteMilestone)
)

export default router