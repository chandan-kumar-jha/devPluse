import { Router } from 'express'
import {
  createSkill,
  listSkills,
  getSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skill.controller'
import authenticate from '../middleware/authenticate'
import validate from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { rateLimit } from 'express-rate-limit'
import {
  createSkillSchema,
  updateSkillSchema,
  listSkillsSchema,
} from '../schemas/skill.schema'

// ── Skill create rate limiter — 20 per hour ────────────────────────
const skillCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many skills added. Try again in an hour.',
    })
  },
})

const router = Router()

// ── All skill routes require authentication ────────────────────────
router.use(authenticate)

router.get('/',
  asyncHandler(listSkills)
)

router.post('/',
  skillCreateLimiter,
  validate(createSkillSchema),
  asyncHandler(createSkill)
)

router.get('/:id',
  asyncHandler(getSkill)
)

router.patch('/:id',
  validate(updateSkillSchema),
  asyncHandler(updateSkill)
)

router.delete('/:id',
  asyncHandler(deleteSkill)
)

export default router