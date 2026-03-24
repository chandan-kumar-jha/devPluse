import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Skill, getTierFromLevel, XP_THRESHOLDS } from '../models/skill.model'
import { Session } from '../models/session.model'
import { AppError } from '../middleware/errorHandler'
import { sanitizeString } from '../utils/sanitize'
import {
  CreateSkillInput,
  UpdateSkillInput,
  ListSkillsInput,
} from '../schemas/skill.schema'

// ── POST /skills ───────────────────────────────────────────────────
export const createSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as CreateSkillInput
  const userId = req.user!.userId

  const name = sanitizeString(body.name)
  const notes = body.notes ? sanitizeString(body.notes) : undefined

  // ── Check duplicate skill name for this user ───────────────────
  const existing = await Skill.findOne({
    userId,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  })

  if (existing) {
    throw new AppError('You already have a skill with this name', 409)
  }

  const level = body.level || 1
  const tier = getTierFromLevel(level)
  const xpToNextLevel = XP_THRESHOLDS[level] || 0

  const skill = await Skill.create({
    userId,
    name,
    category: body.category,
    level,
    tier,
    xp: 0,
    xpToNextLevel,
    notes,
  })

  res.status(201).json({
    success: true,
    message: 'Skill added successfully.',
    data: { skill },
  })
}

// ── GET /skills ────────────────────────────────────────────────────
export const listSkills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const query = req.query as unknown as ListSkillsInput

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  // ── Build filter — userId always first ───────────────────────────
  const filter: Record<string, any> = { userId }

  if (query.category) {
    filter.category = query.category
  }
  if (query.tier) {
    filter.tier = query.tier
  }
  if (query.search) {
    filter.name = {
      $regex: query.search,
      $options: 'i',
    }
  }

  // ── Sort ──────────────────────────────────────────────────────────
  const sortMap: Record<string, any> = {
    level: { level: -1 },
    name: { name: 1 },
    xp: { xp: -1 },
    newest: { createdAt: -1 },
  }
  const sort = sortMap[query.sort as string] || sortMap.level

  const skills = await Skill.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await Skill.countDocuments(filter)

  // ── Tier counts ───────────────────────────────────────────────────
  const [beginnerCount, intermediateCount, advancedCount, expertCount] =
    await Promise.all([
      Skill.countDocuments({ userId, tier: 'beginner' }),
      Skill.countDocuments({ userId, tier: 'intermediate' }),
      Skill.countDocuments({ userId, tier: 'advanced' }),
      Skill.countDocuments({ userId, tier: 'expert' }),
    ])

  res.status(200).json({
    success: true,
    data: {
      skills,
      counts: {
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
        expert: expertCount,
      },
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

// ── GET /skills/:id ────────────────────────────────────────────────
export const getSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const skill = await Skill.findOne({ _id: id, userId })
  if (!skill) {
    throw new AppError('Skill not found', 404)
  }

  // ── Fetch linked sessions ─────────────────────────────────────────
  const linkedSessions = await Session.find({ skillId: id, userId })
    .sort({ date: -1 })
    .select('title duration date tags')
    .lean()

  res.status(200).json({
    success: true,
    data: {
      skill,
      linkedSessions,
    },
  })
}

// ── PATCH /skills/:id ──────────────────────────────────────────────
export const updateSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const skillId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const body = req.body as UpdateSkillInput

  const skill = await Skill.findOne({ _id: skillId, userId })
  if (!skill) {
    throw new AppError('Skill not found', 404)
  }

  const updates: Record<string, any> = {}

  if (body.name !== undefined) {
    const cleanName = sanitizeString(body.name)

    const existing = await Skill.findOne({
      userId,
      _id: { $ne: new mongoose.Types.ObjectId(skillId) },
      name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
    })

    if (existing) {
      throw new AppError('You already have a skill with this name', 409)
    }

    updates.name = cleanName
  }

  if (body.category !== undefined) {
    updates.category = body.category
  }

  if (body.level !== undefined) {
    updates.level = body.level
    updates.tier = getTierFromLevel(body.level)
    updates.xpToNextLevel = XP_THRESHOLDS[body.level] || 0
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes ? sanitizeString(body.notes) : null
  }

  const updatedSkill = await Skill.findByIdAndUpdate(
    skillId,
    { $set: updates },
    { new: true, runValidators: true }
  )

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully.',
    data: { skill: updatedSkill },
  })
}

// ── DELETE /skills/:id ─────────────────────────────────────────────
export const deleteSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const skill = await Skill.findOne({ _id: id, userId })
  if (!skill) {
    throw new AppError('Skill not found', 404)
  }

  // ── Unlink sessions from this skill ──────────────────────────────
  await Session.updateMany(
    { skillId: id, userId },
    { $set: { skillId: null } }
  )

  await skill.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully.',
  })
}