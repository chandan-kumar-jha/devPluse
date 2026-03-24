import { Request, Response } from 'express'
import { z } from 'zod'
import { Notification } from '../models/notification.model'
import { User } from '../models/user.model'
import { AppError } from '../middleware/errorHandler'

// ── GET /notifications ─────────────────────────────────────────────
export const listNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId

  const page = Number(req.query.page) || 1
  const limit = Math.min(Number(req.query.limit) || 20, 50)
  const skip = (page - 1) * limit

  // ── userId always first in query ──────────────────────────────────
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await Notification.countDocuments({ userId })
  const unreadCount = await Notification.countDocuments({
    userId,
    read: false,
  })

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  })
}

// ── PATCH /notifications/read-all ─────────────────────────────────
// must be defined BEFORE /:id route to avoid conflict
export const markAllRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId

  // ── updateMany with userId filter — safe by design ───────────────
  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  )

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.',
  })
}

// ── GET /notifications/preferences ────────────────────────────────
export const getPreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user!.userId).select(
    'notificationPrefs'
  )
  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { preferences: user.notificationPrefs },
  })
}

// ── PATCH /notifications/preferences ──────────────────────────────
export const updatePreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  // ── Validate — only boolean values accepted ───────────────────────
  const prefsSchema = z.object({
    skill_levelup: z.boolean().optional(),
    goal_deadline: z.boolean().optional(),
    streak_broken: z.boolean().optional(),
  })

  const parsed = prefsSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError('Invalid preferences. Only boolean values accepted.', 400)
  }

  const updates: Record<string, any> = {}
  const { skill_levelup, goal_deadline, streak_broken } = parsed.data

  if (skill_levelup !== undefined) {
    updates['notificationPrefs.skill_levelup'] = skill_levelup
  }
  if (goal_deadline !== undefined) {
    updates['notificationPrefs.goal_deadline'] = goal_deadline
  }
  if (streak_broken !== undefined) {
    updates['notificationPrefs.streak_broken'] = streak_broken
  }

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { $set: updates },
    { new: true }
  ).select('notificationPrefs')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully.',
    data: { preferences: user.notificationPrefs },
  })
}

// ── PATCH /notifications/:id/read ─────────────────────────────────
export const markOneRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  // ── Ownership check ───────────────────────────────────────────────
  const notification = await Notification.findOne({ _id: id, userId })
  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  notification.read = true
  await notification.save()

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data: { notification },
  })
}

// ── DELETE /notifications/:id ──────────────────────────────────────
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  // ── Ownership check ───────────────────────────────────────────────
  const notification = await Notification.findOne({ _id: id, userId })
  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  await notification.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Notification deleted.',
  })
}