import { Router } from 'express'
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getPublicProfile,
  deleteAccount,
  upload,
} from '../controllers/profile.controller'
import authenticate from '../middleware/authenticate'
import validate from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import {
  profileUpdateLimiter,
  avatarUploadLimiter,
} from '../middleware/rateLimiter'
import {
  updateProfileSchema,
  deleteAccountSchema,
} from '../schemas/profile.schema'

const router = Router()

// ── Protected routes ───────────────────────────────────────────────
router.get('/me',
  authenticate,
  asyncHandler(getMyProfile)
)

router.patch('/me',
  authenticate,
  profileUpdateLimiter,
  validate(updateProfileSchema),
  asyncHandler(updateProfile)
)

router.post('/avatar',
  authenticate,
  avatarUploadLimiter,
  upload.single('avatar'),  // ← multer middleware — field name must be "avatar"
  asyncHandler(uploadAvatar)
)

router.delete('/avatar',
  authenticate,
  asyncHandler(deleteAvatar)
)

router.delete('/me',
  authenticate,
  validate(deleteAccountSchema),
  asyncHandler(deleteAccount)
)

// ── Public routes ──────────────────────────────────────────────────
router.get('/:username',
  asyncHandler(getPublicProfile)
)

export default router