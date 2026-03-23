import { User } from '../models/user.model'
import { Session } from '../models/session.model'
import mongoose from 'mongoose'

// ── Check if two dates are on the same day ─────────────────────────
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// ── Check if date1 is exactly one day before date2 ─────────────────
const isYesterday = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diffMs = d2.getTime() - d1.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays === 1
}

// ── Update streak after session create ────────────────────────────
export const updateStreakOnCreate = async (
  userId: mongoose.Types.ObjectId,
  sessionDate: Date
): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  const today = new Date(sessionDate)
  const lastDate = user.lastSessionDate

  if (!lastDate) {
    // first session ever
    user.currentStreak = 1
    user.longestStreak = 1
    user.lastSessionDate = today
  } else if (isSameDay(lastDate, today)) {
    // already logged a session today — no streak change
    return
  } else if (isYesterday(lastDate, today)) {
    // consecutive day — increment streak
    user.currentStreak += 1
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak
    }
    user.lastSessionDate = today
  } else {
    // gap detected — streak broken, reset to 1
    user.currentStreak = 1
    user.lastSessionDate = today
  }

  await user.save()
}

// ── Recalculate streak after session delete ────────────────────────
// recalculates from scratch based on remaining sessions
export const recalculateStreak = async (
  userId: mongoose.Types.ObjectId
): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  // get all sessions sorted by date descending
  const sessions = await Session.find({ userId })
    .sort({ date: -1 })
    .select('date')
    .lean()

  if (!sessions.length) {
    // no sessions left — reset streak
    user.currentStreak = 0
    user.lastSessionDate = null as any
    await user.save()
    return
  }

  // get unique days only
  const uniqueDays = [
    ...new Map(
      sessions.map((s) => {
        const d = new Date(s.date)
        d.setHours(0, 0, 0, 0)
        return [d.getTime(), d]
      })
    ).values(),
  ].sort((a, b) => b.getTime() - a.getTime()) // newest first

  // calculate current streak from today/yesterday backwards
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const mostRecentDay = uniqueDays[0]

  // streak is only active if most recent session was today or yesterday
  const diffFromToday =
    (today.getTime() - mostRecentDay.getTime()) / (1000 * 60 * 60 * 24)

  if (diffFromToday > 1) {
    // most recent session was more than yesterday — streak broken
    user.currentStreak = 0
    user.lastSessionDate = mostRecentDay
    await user.save()
    return
  }

  // count consecutive days backwards
  currentStreak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff =
      (uniqueDays[i - 1].getTime() - uniqueDays[i].getTime()) /
      (1000 * 60 * 60 * 24)
    if (diff === 1) {
      currentStreak++
    } else {
      break
    }
  }

  user.currentStreak = currentStreak
  user.lastSessionDate = mostRecentDay

  // recalculate longest streak too
  let longestStreak = 1
  let tempStreak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff =
      (uniqueDays[i - 1].getTime() - uniqueDays[i].getTime()) /
      (1000 * 60 * 60 * 24)
    if (diff === 1) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 1
    }
  }

  user.longestStreak = Math.max(longestStreak, user.longestStreak)
  await user.save()
}