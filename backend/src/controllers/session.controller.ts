import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Session } from '../models/session.model'
import { Goal } from '../models/goal.model'
import { Skill } from '../models/skill.model'
import { AppError } from '../middleware/errorHandler'
import { sanitizeString } from '../utils/sanitize'
import { updateStreakOnCreate, recalculateStreak } from '../utils/streak'
import { addXPToSkill, removeXPFromSkill } from '../utils/xp'
import {
  CreateSessionInput,
  UpdateSessionInput,
  ListSessionsInput,
} from '../schemas/session.schema'

// ── POST /sessions ─────────────────────────────────────────────────
export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as CreateSessionInput
  const userId = req.user!.userId

  const title = sanitizeString(body.title)
  const notes = body.notes ? sanitizeString(body.notes) : undefined
  const tags = body.tags
    ? [...new Set(body.tags.map((t) => t.toLowerCase().trim()))]
    : []

  // ── Verify goalId belongs to this user ───────────────────────────
  if (body.goalId) {
    const goal = await Goal.findOne({ _id: body.goalId, userId })
    if (!goal) {
      throw new AppError('Goal not found or does not belong to you', 404)
    }
  }

  // ── Verify skillId belongs to this user ──────────────────────────
  if (body.skillId) {
    const skill = await Skill.findOne({ _id: body.skillId, userId })
    if (!skill) {
      throw new AppError('Skill not found or does not belong to you', 404)
    }
  }

  // ── Create session ────────────────────────────────────────────────
  const session = await Session.create({
    userId,
    title,
    duration: body.duration,
    date: new Date(body.date),
    notes,
    tags,
    goalId: body.goalId
      ? new mongoose.Types.ObjectId(body.goalId)
      : undefined,
    skillId: body.skillId
      ? new mongoose.Types.ObjectId(body.skillId)
      : undefined,
  })

  // ── Update streak ─────────────────────────────────────────────────
  await updateStreakOnCreate(userId, new Date(body.date))

  // ── Add XP to skill if linked ─────────────────────────────────────
  if (body.skillId) {
    await addXPToSkill(
      new mongoose.Types.ObjectId(body.skillId),
      userId,
      body.duration
    )
  }

  // ── Increment goal session count if linked ────────────────────────
  if (body.goalId) {
    await Goal.findByIdAndUpdate(body.goalId, {
      $inc: { sessionCount: 1 },
    })
  }

  res.status(201).json({
    success: true,
    message: 'Session logged successfully.',
    data: { session },
  })
}

// ── GET /sessions ──────────────────────────────────────────────────
export const listSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const query = req.query as unknown as ListSessionsInput

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  // ── Build filter — userId always first ───────────────────────────
  const filter: Record<string, any> = { userId }

  if (query.dateFrom || query.dateTo) {
    filter.date = {}
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom as string)
    if (query.dateTo) filter.date.$lte = new Date(query.dateTo as string)
  }

  if (query.tag) {
    filter.tags = (query.tag as string).toLowerCase().trim()
  }

  // ── Sort ──────────────────────────────────────────────────────────
  const sortMap: Record<string, any> = {
    newest: { date: -1 },
    oldest: { date: 1 },
    longest: { duration: -1 },
    shortest: { duration: 1 },
  }
  const sort = sortMap[query.sort as string] || sortMap.newest

  let sessions
  let total

  if (query.search) {
    sessions = await Session.find(
      { ...filter, $text: { $search: query.search as string } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean()

    total = await Session.countDocuments({
      ...filter,
      $text: { $search: query.search as string },
    })
  } else {
    sessions = await Session.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    total = await Session.countDocuments(filter)
  }

  res.status(200).json({
    success: true,
    data: {
      sessions,
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

// ── GET /sessions/:id ──────────────────────────────────────────────
export const getSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const session = await Session.findOne({ _id: id, userId })
  if (!session) {
    throw new AppError('Session not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { session },
  })
}

// ── PATCH /sessions/:id ────────────────────────────────────────────
export const updateSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params
  const body = req.body as UpdateSessionInput

  const session = await Session.findOne({ _id: id, userId })
  if (!session) {
    throw new AppError('Session not found', 404)
  }

  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    updates.title = sanitizeString(body.title)
  }
  if (body.duration !== undefined) {
    updates.duration = body.duration
  }
  if (body.date !== undefined) {
    updates.date = new Date(body.date)
  }
  if (body.notes !== undefined) {
    updates.notes = body.notes ? sanitizeString(body.notes) : undefined
  }
  if (body.tags !== undefined) {
    updates.tags = [...new Set(body.tags.map((t) => t.toLowerCase().trim()))]
  }

  // ── Verify new goalId ────────────────────────────────────────────
  if (body.goalId !== undefined) {
    if (body.goalId) {
      const goal = await Goal.findOne({ _id: body.goalId, userId })
      if (!goal) {
        throw new AppError('Goal not found or does not belong to you', 404)
      }
      if (session.goalId && session.goalId.toString() !== body.goalId) {
        await Goal.findByIdAndUpdate(session.goalId, {
          $inc: { sessionCount: -1 },
        })
        await Goal.findByIdAndUpdate(body.goalId, {
          $inc: { sessionCount: 1 },
        })
      }
      updates.goalId = new mongoose.Types.ObjectId(body.goalId)
    } else {
      if (session.goalId) {
        await Goal.findByIdAndUpdate(session.goalId, {
          $inc: { sessionCount: -1 },
        })
      }
      updates.goalId = undefined
    }
  }

  // ── Verify new skillId ───────────────────────────────────────────
  if (body.skillId !== undefined) {
    if (body.skillId) {
      const skill = await Skill.findOne({ _id: body.skillId, userId })
      if (!skill) {
        throw new AppError('Skill not found or does not belong to you', 404)
      }
      if (session.skillId && session.skillId.toString() !== body.skillId) {
        await removeXPFromSkill(
          session.skillId as mongoose.Types.ObjectId,
          userId,
          session.duration
        )
        await addXPToSkill(
          new mongoose.Types.ObjectId(body.skillId),
          userId,
          body.duration || session.duration
        )
      }
      updates.skillId = new mongoose.Types.ObjectId(body.skillId)
    } else {
      if (session.skillId) {
        await removeXPFromSkill(
          session.skillId as mongoose.Types.ObjectId,
          userId,
          session.duration
        )
      }
      updates.skillId = undefined
    }
  }

  const updatedSession = await Session.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  )

  res.status(200).json({
    success: true,
    message: 'Session updated successfully.',
    data: { session: updatedSession },
  })
}

// ── DELETE /sessions/:id ───────────────────────────────────────────
export const deleteSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const session = await Session.findOne({ _id: id, userId })
  if (!session) {
    throw new AppError('Session not found', 404)
  }

  if (session.skillId) {
    await removeXPFromSkill(
      session.skillId as mongoose.Types.ObjectId,
      userId,
      session.duration
    )
  }

  if (session.goalId) {
    await Goal.findByIdAndUpdate(session.goalId, {
      $inc: { sessionCount: -1 },
    })
  }

  await session.deleteOne()
  await recalculateStreak(userId)

  res.status(200).json({
    success: true,
    message: 'Session deleted successfully.',
  })
}