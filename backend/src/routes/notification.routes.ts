import { Router } from 'express'
import {
  listNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller'
import authenticate from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

// ── All notification routes require authentication ─────────────────
router.use(authenticate)

// ── IMPORTANT — specific routes before /:id ───────────────────────
// read-all and preferences must come BEFORE /:id
// otherwise Express matches "read-all" as an :id param

router.get('/', asyncHandler(listNotifications))

router.patch('/read-all', asyncHandler(markAllRead))

router.get('/preferences', asyncHandler(getPreferences))

router.patch('/preferences', asyncHandler(updatePreferences))

router.patch('/:id/read', asyncHandler(markOneRead))

router.delete('/:id', asyncHandler(deleteNotification))

export default router