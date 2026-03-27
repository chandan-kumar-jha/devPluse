import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Session } from '../models/session.model'
import { Goal } from '../models/goal.model'
import { Skill } from '../models/skill.model'
import { User } from '../models/user.model'
import { AppError } from '../middleware/errorHandler'

export const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId
  const userObjectId = new mongoose.Types.ObjectId(userId.toString())

  // 1. Date range calculation
  const dateRange = (req.query.dateRange as string) || '30d'
  const rangeMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
  const days = rangeMap[dateRange] || 30
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  // 2. Parallel Queries
  const [
    summaryStats,
    sessionsPerWeekRaw, // Raw aggregation results
    goalStatusCounts,
    skillTierCounts,
    recentSessions,
    pinnedGoals,
    user,
    heatmapData,
  ] = await Promise.all([
    // Summary
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
    // Chart Aggregation
    Session.aggregate([
      { $match: { userId: userObjectId, date: { $gte: dateFrom } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, week: { $week: '$date' } },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]),
    Goal.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Skill.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
    ]),
    Session.find({ userId }).sort({ date: -1 }).limit(5).select('title duration date tags').lean(),
    Goal.find({ userId, pinned: true }).select('title status progress').lean(),
    User.findById(userId).select('currentStreak longestStreak lastSessionDate').lean(),
    Session.aggregate([
      { $match: { userId: userObjectId, date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
      { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' }, d: { $dayOfMonth: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]),
  ])

  if (!user) throw new AppError('User not found', 404)

  // ── DATA TRANSFORMATIONS FOR FRONTEND (RECHARTS FIX) ──────────────────

  // 1. Flatten Sessions Per Week (Charts Fix)
  const sessionsPerWeek = sessionsPerWeekRaw.map(item => ({
    name: `Week ${item._id.week}`, // X-Axis Label
    sessions: item.count,          // Bar Height
    duration: item.totalDuration
  }))

  // 2. Format Summary Stats
  const [totalSessions, durationResult, activeGoals, completedGoals, totalSkills] = summaryStats
  const totalHours = Math.round(((durationResult[0]?.totalMinutes || 0) / 60) * 10) / 10

  // 3. Goal Status (Donut Chart Fix)
  const goalStatus = [
    { name: 'Active', value: 0, color: '#6366f1' },
    { name: 'Done', value: 0, color: '#10b981' },
    { name: 'Archived', value: 0, color: '#94a3b8' }
  ]
  goalStatusCounts.forEach((item: any) => {
    const match = goalStatus.find(g => g.name.toLowerCase() === item._id.toLowerCase())
    if (match) match.value = item.count
  })

  // 4. Heatmap Formatting
  const heatmap = heatmapData.map((item: any) => ({
    date: `${item._id.y}-${String(item._id.m).padStart(2, '0')}-${String(item._id.d).padStart(2, '0')}`,
    count: item.count,
  }))

  res.status(200).json({
    success: true,
    data: {
      stats: { totalSessions, totalHours, activeGoals, completedGoals, totalSkills },
      streak: {
        current: user.currentStreak || 0,
        longest: user.longestStreak || 0,
        lastSessionDate: user.lastSessionDate,
      },
      charts: {
        sessionsPerWeek, // Ab ye "Week 12" format mein hai
        goalStatus,      // Ab ye Recharts compatible array hai
        skillTiers: skillTierCounts, 
      },
      widgets: {
        recentSessions,
        pinnedGoals,
      },
      heatmap,
      dateRange,
    },
  })
}