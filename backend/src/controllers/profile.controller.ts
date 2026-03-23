import { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import sharp from 'sharp'
import { User } from '../models/user.model'
import { RefreshToken } from '../models/refreshToken.model'
import { Session } from '../models/session.model'
import { Goal } from '../models/goal.model'
import { Skill } from '../models/skill.model'
import { Notification } from '../models/notification.model'
import { AppError } from '../middleware/errorHandler'
import { clearAuthCookies } from '../utils/cookies'
import { sanitizeString } from '../utils/sanitize'
import { UpdateProfileInput, DeleteAccountInput } from '../schemas/profile.schema'
import { env } from '../config/env'

// ── Cloudinary config ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

// ── Multer — memory storage (no disk writes) ───────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      cb(new AppError('Only jpg, png and webp images are allowed', 400))
      return
    }
    cb(null, true)
  },
})

// ── GET /profile/me ────────────────────────────────────────────────
export const getMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user?.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { user },
  })
}

// ── PATCH /profile/me ──────────────────────────────────────────────
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as UpdateProfileInput

  // ── Sanitise string fields ───────────────────────────────────────
  const updates: Record<string, any> = {}

  if (body.name !== undefined) {
    updates.name = sanitizeString(body.name)
  }
  if (body.username !== undefined) {
    updates.username = sanitizeString(body.username).toLowerCase()
  }
  if (body.bio !== undefined) {
    updates.bio = body.bio ? sanitizeString(body.bio) : null
  }
  if (body.currentRole !== undefined) {
    updates.currentRole = body.currentRole
      ? sanitizeString(body.currentRole)
      : null
  }
  if (body.githubUsername !== undefined) {
    updates.githubUsername = body.githubUsername
      ? sanitizeString(body.githubUsername)
      : null
  }
  if (body.timezone !== undefined) {
    updates.timezone = body.timezone
  }
  if (body.avatarUrl !== undefined) {
    updates.avatarUrl = body.avatarUrl
  }

  // ── Check username unique if changing ────────────────────────────
  if (updates.username) {
    const existing = await User.findOne({
      username: updates.username,
      _id: { $ne: req.user?.userId }, // exclude current user
    })
    if (existing) {
      throw new AppError('Username already taken', 409)
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user?.userId,
    { $set: updates },
    { new: true, runValidators: true }
  )

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: { user },
  })
}

// ── POST /profile/avatar ───────────────────────────────────────────
export const uploadAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    throw new AppError('No image file provided', 400)
  }

  const user = await User.findById(req.user?.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // ── Delete old avatar from Cloudinary ────────────────────────────
  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId)
  }

  // ── Process image with sharp ──────────────────────────────────────
  // resize to 400x400, convert to webp, strip EXIF metadata
  const processedBuffer = await sharp(req.file.buffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 85 })
    .toBuffer()

  // ── Upload to Cloudinary ──────────────────────────────────────────
  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'devpulse/avatars',
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) reject(new AppError('Avatar upload failed', 500))
          else resolve(result)
        }
      )
      .end(processedBuffer)
  })

  // ── Save URL and publicId to user ─────────────────────────────────
  user.avatarUrl = uploadResult.secure_url
  user.avatarPublicId = uploadResult.public_id
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully.',
    data: {
      avatarUrl: user.avatarUrl,
    },
  })
}

// ── DELETE /profile/avatar ─────────────────────────────────────────
export const deleteAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user?.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (!user.avatarPublicId) {
    throw new AppError('No avatar to remove', 400)
  }

  // ── Delete from Cloudinary ────────────────────────────────────────
  await cloudinary.uploader.destroy(user.avatarPublicId)

  // ── Clear avatar fields ───────────────────────────────────────────
  user.avatarUrl = null as any
  user.avatarPublicId = null as any
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Avatar removed successfully.',
  })
}

// ── GET /profile/:username — public profile ────────────────────────
export const getPublicProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const username = req.params.username as string

  const user = await User.findOne({
    username: username.toLowerCase(),
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  // ── Check visibility ──────────────────────────────────────────────
  if (user.privacySettings.profileVisibility === 'private') {
    throw new AppError('This profile is private', 403)
  }

  // ── Return safe public fields only ───────────────────────────────
  const publicProfile = {
    name: user.name,
    username: user.username,
    bio: user.bio,
    currentRole: user.currentRole,
    avatarUrl: user.avatarUrl,
    githubUsername: user.githubUsername,
    timezone: user.timezone,
    currentStreak: user.privacySettings.hideStats
      ? null
      : user.currentStreak,
    longestStreak: user.privacySettings.hideStats
      ? null
      : user.longestStreak,
    createdAt: user.createdAt,
  }

  res.status(200).json({
    success: true,
    data: { user: publicProfile },
  })
}

// ── DELETE /profile/me — delete account ───────────────────────────
export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.body as DeleteAccountInput

  const user = await User.findById(req.user?.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // ── Verify typed username matches ────────────────────────────────
  if (username.toLowerCase() !== user.username.toLowerCase()) {
    throw new AppError('Username does not match. Account not deleted.', 400)
  }

  // ── Delete Cloudinary avatar ──────────────────────────────────────
  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId)
  }

  // ── Cascade delete all user data ─────────────────────────────────
  await Promise.all([
    Session.deleteMany({ userId: user._id }),
    Goal.deleteMany({ userId: user._id }),
    Skill.deleteMany({ userId: user._id }),
    Notification.deleteMany({ userId: user._id }),
    RefreshToken.deleteMany({ userId: user._id }),
  ])

  // ── Delete user document ──────────────────────────────────────────
  await user.deleteOne()

  // ── Clear cookies ─────────────────────────────────────────────────
  clearAuthCookies(res)

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully.',
  })
}