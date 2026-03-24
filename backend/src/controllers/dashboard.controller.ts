import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Session } from '../models/session.model'
import { Goal } from '../models/goal.model'
import { Skill } from '../models/skill.model'
import { User } from '../models/user.model'
import { AppError } from '../middleware/errorHandler'

// ── GET /dashboard ─────────────────────────────────────────────────
export const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId

  // ── Date range — default 30 days ──────────────────────────────────
  const dateRange = (req.query.dateRange as string) || '30d'
  const rangeMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }
  const days = rangeMap[dateRange] || 30
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  const userObjectId = new mongoose.Types.ObjectId(userId.toString())

  // ── Run all queries in parallel ───────────────────────────────────
  const [
    summaryStats,
    sessionsPerWeek,
    goalStatusCounts,
    skillTierCounts,
    recentSessions,
    pinnedGoals,
    user,
    heatmapData,
  ] = await Promise.all([

    // ── Summary stats ───────────────────────────────────────────────
    Promise.all([
      Session.countDocuments({ userId }),
      Session.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, totalMinutes: { $sum: '$duration' } } },
      ]),
      Goal.countDocuments({ userId, status: 'active' }),
      Goal.countDocuments({ userId, status: 'done' }),
      Skill.countDocuments({ userId }),
    ]),

    // ── Sessions per week — bar chart ───────────────────────────────
    Session.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' },
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]),

    // ── Goal status counts — donut chart ────────────────────────────
    Goal.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // ── Skill tier distribution — bar chart ─────────────────────────
    Skill.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
        },
      },
    ]),

    // ── Recent sessions — last 5 ────────────────────────────────────
    Session.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .select('title duration date tags goalId skillId')
      .lean(),

    // ── Pinned goals ────────────────────────────────────────────────
    Goal.find({ userId, pinned: true })
      .select('title status progress deadline milestones')
      .lean(),

    // ── User streak data ────────────────────────────────────────────
    User.findById(userId)
      .select('currentStreak longestStreak lastSessionDate')
      .lean(),

    // ── Heatmap data — sessions per day last 365 days ───────────────
    Session.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: {
            $gte: new Date(
              new Date().setFullYear(new Date().getFullYear() - 1)
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
  ])

  if (!user) {
    throw new AppError('User not found', 404)
  }

  // ── Format summary stats ──────────────────────────────────────────
  const [
    totalSessions,
    durationResult,
    activeGoals,
    completedGoals,
    totalSkills,
  ] = summaryStats

  const totalMinutes = durationResult[0]?.totalMinutes || 0
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  // ── Format goal status counts ─────────────────────────────────────
  const goalCounts = {
    active: 0,
    done: 0,
    archived: 0,
  }
  goalStatusCounts.forEach((item: any) => {
    goalCounts[item._id as keyof typeof goalCounts] = item.count
  })

  // ── Format skill tier counts ──────────────────────────────────────
  const tierCounts = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  }
  skillTierCounts.forEach((item: any) => {
    tierCounts[item._id as keyof typeof tierCounts] = item.count
  })

  // ── Format heatmap data ───────────────────────────────────────────
  const heatmap = heatmapData.map((item: any) => ({
    date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
    count: item.count,
    duration: item.totalDuration,
  }))

  res.status(200).json({
    success: true,
    data: {
      // ── Summary cards ─────────────────────────────────────────────
      stats: {
        totalSessions,
        totalHours,
        activeGoals,
        completedGoals,
        totalSkills,
      },

      // ── Streak widget ─────────────────────────────────────────────
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak,
        lastSessionDate: user.lastSessionDate,
      },

      // ── Charts ────────────────────────────────────────────────────
      charts: {
        sessionsPerWeek,
        goalStatus: goalCounts,
        skillTiers: tierCounts,
      },

      // ── Widgets ───────────────────────────────────────────────────
      widgets: {
        recentSessions,
        pinnedGoals,
      },

      // ── Heatmap ───────────────────────────────────────────────────
      heatmap,

      // ── Date range applied ────────────────────────────────────────
      dateRange,
    },
  })
}