import { Router } from 'express'
import {
  getPrivacySettings,
  updatePrivacySettings,
  exportData,
} from '../controllers/settings.controller'
import authenticate from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'
import { exportLimiter } from '../middleware/rateLimiter'

const router = Router()

// ── All settings routes require authentication ─────────────────────
router.use(authenticate)

router.get('/privacy', asyncHandler(getPrivacySettings))

router.patch('/privacy', asyncHandler(updatePrivacySettings))

router.get('/export',
  exportLimiter,
  asyncHandler(exportData)
)

export default router