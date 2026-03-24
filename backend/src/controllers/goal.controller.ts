import { Request, Response } from 'express'
import { Goal, calculateProgress } from '../models/goal.model'
import { Session } from '../models/session.model'
import { AppError } from '../middleware/errorHandler'
import { sanitizeString } from '../utils/sanitize'
import {
  CreateGoalInput,
  UpdateGoalInput,
  AddMilestoneInput,
  ListGoalsInput,
} from '../schemas/goal.schema'

// ── POST /goals ────────────────────────────────────────────────────
export const createGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as CreateGoalInput
  const userId = req.user!.userId

  // ── Sanitise ──────────────────────────────────────────────────────
  const title = sanitizeString(body.title)
  const description = body.description
    ? sanitizeString(body.description)
    : undefined
  const category = body.category ? sanitizeString(body.category) : undefined

  // ── Sanitise milestones ───────────────────────────────────────────
  const milestones = (body.milestones || []).map((m, index) => ({
    title: sanitizeString(m.title),
    completed: false,
    order: m.order ?? index,
  }))

  const goal = await Goal.create({
    userId,
    title,
    description,
    deadline: body.deadline ? new Date(body.deadline) : undefined,
    category,
    status: 'active',
    progress: 0,
    pinned: false,
    sessionCount: 0,
    milestones,
  })

  res.status(201).json({
    success: true,
    message: 'Goal created successfully.',
    data: { goal },
  })
}

// ── GET /goals ─────────────────────────────────────────────────────
export const listGoals = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const query = req.query as unknown as ListGoalsInput

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  // ── Build filter — userId always first ───────────────────────────
  const filter: Record<string, any> = { userId }

  if (query.status) {
    filter.status = query.status
  }
  if (query.category) {
    filter.category = query.category.trim()
  }

  // ── Sort ──────────────────────────────────────────────────────────
  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    deadline: { deadline: 1 },
    progress: { progress: -1 },
  }
  const sort = sortMap[query.sort as string] || sortMap.newest

  const goals = await Goal.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await Goal.countDocuments(filter)

  // ── Status counts ─────────────────────────────────────────────────
  const [activeCount, doneCount, archivedCount] = await Promise.all([
    Goal.countDocuments({ userId, status: 'active' }),
    Goal.countDocuments({ userId, status: 'done' }),
    Goal.countDocuments({ userId, status: 'archived' }),
  ])

  res.status(200).json({
    success: true,
    data: {
      goals,
      counts: {
        active: activeCount,
        done: doneCount,
        archived: archivedCount,
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

// ── GET /goals/:id ─────────────────────────────────────────────────
export const getGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { goal },
  })
}

// ── PATCH /goals/:id ───────────────────────────────────────────────
export const updateGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params
  const body = req.body as UpdateGoalInput

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  const updates: Record<string, any> = {}

  if (body.title !== undefined) {
    updates.title = sanitizeString(body.title)
  }
  if (body.description !== undefined) {
    updates.description = body.description
      ? sanitizeString(body.description)
      : null
  }
  if (body.deadline !== undefined) {
    updates.deadline = body.deadline ? new Date(body.deadline) : null
  }
  if (body.category !== undefined) {
    updates.category = body.category ? sanitizeString(body.category) : null
  }
  if (body.status !== undefined) {
    updates.status = body.status
  }

  const updatedGoal = await Goal.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  )

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully.',
    data: { goal: updatedGoal },
  })
}

// ── DELETE /goals/:id ──────────────────────────────────────────────
export const deleteGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  // ── Unlink sessions from this goal ───────────────────────────────
  await Session.updateMany(
    { goalId: id, userId },
    { $set: { goalId: null } }
  )

  await goal.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully.',
  })
}

// ── PATCH /goals/:id/archive ───────────────────────────────────────
export const archiveGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  if (goal.status === 'archived') {
    throw new AppError('Goal is already archived', 400)
  }

  // ── Unpin if pinned ───────────────────────────────────────────────
  goal.status = 'archived'
  if (goal.pinned) {
    goal.pinned = false
  }
  await goal.save()

  res.status(200).json({
    success: true,
    message: 'Goal archived successfully.',
    data: { goal },
  })
}

// ── PATCH /goals/:id/pin ───────────────────────────────────────────
export const togglePin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  // ── Cannot pin archived goals ─────────────────────────────────────
  if (goal.status === 'archived') {
    throw new AppError('Cannot pin an archived goal', 400)
  }

  if (!goal.pinned) {
    // ── Check max 3 pinned ────────────────────────────────────────
    const pinnedCount = await Goal.countDocuments({ userId, pinned: true })
    if (pinnedCount >= 3) {
      throw new AppError(
        'Maximum 3 goals can be pinned. Unpin another goal first.',
        400
      )
    }
  }

  goal.pinned = !goal.pinned
  await goal.save()

  res.status(200).json({
    success: true,
    message: goal.pinned ? 'Goal pinned.' : 'Goal unpinned.',
    data: { goal },
  })
}

// ── POST /goals/:id/milestones ─────────────────────────────────────
export const addMilestone = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id } = req.params
  const body = req.body as AddMilestoneInput

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  // ── Add milestone ─────────────────────────────────────────────────
  const newMilestone = {
    title: sanitizeString(body.title),
    completed: false,
    order: body.order ?? goal.milestones.length,
  }

  goal.milestones.push(newMilestone as any)

  // ── Recalculate progress ──────────────────────────────────────────
  goal.progress = calculateProgress(goal.milestones)
  await goal.save()

  res.status(201).json({
    success: true,
    message: 'Milestone added successfully.',
    data: { goal },
  })
}

// ── PATCH /goals/:id/milestones/:mid ──────────────────────────────
export const toggleMilestone = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id, mid } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  // ── Find milestone ────────────────────────────────────────────────
  const milestone = (goal.milestones as any).id(mid)
  if (!milestone) {
    throw new AppError('Milestone not found', 404)
  }

  // ── Toggle completed ──────────────────────────────────────────────
  milestone.completed = !milestone.completed

  // ── Recalculate progress ──────────────────────────────────────────
  goal.progress = calculateProgress(goal.milestones)

  // ── Auto complete goal if 100% ────────────────────────────────────
  if (goal.progress === 100 && goal.status === 'active') {
    goal.status = 'done'
  }

  // ── Reactivate if unchecked and was auto-completed ────────────────
  if (goal.progress < 100 && goal.status === 'done') {
    goal.status = 'active'
  }

  await goal.save()

  res.status(200).json({
    success: true,
    message: milestone.completed
      ? 'Milestone completed.'
      : 'Milestone uncompleted.',
    data: { goal },
  })
}

// ── DELETE /goals/:id/milestones/:mid ──────────────────────────────
export const deleteMilestone = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const { id, mid } = req.params

  const goal = await Goal.findOne({ _id: id, userId })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

 const milestone = (goal.milestones as any).id(mid)
  if (!milestone) {
    throw new AppError('Milestone not found', 404)
  }

  // ── Remove milestone ──────────────────────────────────────────────
  milestone.deleteOne()

  // ── Recalculate progress ──────────────────────────────────────────
  goal.progress = calculateProgress(goal.milestones)

  await goal.save()

  res.status(200).json({
    success: true,
    message: 'Milestone deleted successfully.',
    data: { goal },
  })
}