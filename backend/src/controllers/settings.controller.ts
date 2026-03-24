import { Request, Response } from 'express'
import { z } from 'zod'
import { User } from '../models/user.model'
import { Session } from '../models/session.model'
import { Goal } from '../models/goal.model'
import { Skill } from '../models/skill.model'
import { Notification } from '../models/notification.model'
import { AppError } from '../middleware/errorHandler'

// ── GET /settings/privacy ──────────────────────────────────────────
export const getPrivacySettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user!.userId).select('privacySettings')
  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { privacySettings: user.privacySettings },
  })
}

// ── PATCH /settings/privacy ────────────────────────────────────────
export const updatePrivacySettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  // ── Validate ──────────────────────────────────────────────────────
  const privacySchema = z.object({
    profileVisibility: z.enum(['public', 'private']).optional(),
    hideStats: z.boolean().optional(),
  })

  const parsed = privacySchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError('Invalid privacy settings.', 400)
  }

  const updates: Record<string, any> = {}
  const { profileVisibility, hideStats } = parsed.data

  if (profileVisibility !== undefined) {
    updates['privacySettings.profileVisibility'] = profileVisibility
  }
  if (hideStats !== undefined) {
    updates['privacySettings.hideStats'] = hideStats
  }

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { $set: updates },
    { new: true }
  ).select('privacySettings')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Privacy settings updated.',
    data: { privacySettings: user.privacySettings },
  })
}

// ── GET /settings/export ───────────────────────────────────────────
export const exportData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const format = (req.query.format as string) || 'json'

  if (!['json', 'csv'].includes(format)) {
    throw new AppError('Format must be json or csv', 400)
  }

  // ── Fetch all user data — userId filter on every query ────────────
  const [user, sessions, goals, skills] = await Promise.all([
    User.findById(userId).lean(),
    Session.find({ userId }).lean(),
    Goal.find({ userId }).lean(),
    Skill.find({ userId }).lean(),
  ])

  if (!user) {
    throw new AppError('User not found', 404)
  }

  // ── Strip sensitive fields ────────────────────────────────────────
  const safeUser = {
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    currentRole: user.currentRole,
    githubUsername: user.githubUsername,
    timezone: user.timezone,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    createdAt: user.createdAt,
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: safeUser,
    sessions,
    goals,
    skills,
  }

  // ── JSON export ───────────────────────────────────────────────────
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="devpulse-export.json"'
    )
    res.status(200).json(exportData)
    return
  }

  // ── CSV export ────────────────────────────────────────────────────
  const csvSections: string[] = []

  // profile section
  csvSections.push('=== PROFILE ===')
  csvSections.push(Object.keys(safeUser).join(','))
  csvSections.push(
    Object.values(safeUser)
      .map((v) => `"${v ?? ''}"`)
      .join(',')
  )
  csvSections.push('')

  // sessions section
  if (sessions.length > 0) {
    csvSections.push('=== SESSIONS ===')
    csvSections.push('title,duration,date,notes,tags')
    sessions.forEach((s) => {
      csvSections.push(
        `"${s.title}","${s.duration}","${s.date}","${s.notes ?? ''}","${(s.tags || []).join(';')}"`
      )
    })
    csvSections.push('')
  }

  // goals section
  if (goals.length > 0) {
    csvSections.push('=== GOALS ===')
    csvSections.push('title,status,progress,deadline,category')
    goals.forEach((g) => {
      csvSections.push(
        `"${g.title}","${g.status}","${g.progress}","${g.deadline ?? ''}","${g.category ?? ''}"`
      )
    })
    csvSections.push('')
  }

  // skills section
  if (skills.length > 0) {
    csvSections.push('=== SKILLS ===')
    csvSections.push('name,category,level,tier,xp')
    skills.forEach((s) => {
      csvSections.push(
        `"${s.name}","${s.category}","${s.level}","${s.tier}","${s.xp}"`
      )
    })
  }

  const csvContent = csvSections.join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="devpulse-export.csv"'
  )
  res.status(200).send(csvContent)
}