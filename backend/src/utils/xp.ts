import { Skill, XP_THRESHOLDS, getTierFromLevel } from '../models/skill.model'
import { Notification } from '../models/notification.model'
import mongoose from 'mongoose'

// ── Add XP to skill + handle level up ─────────────────────────────
export const addXPToSkill = async (
  skillId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  xpToAdd: number
): Promise<void> => {
  const skill = await Skill.findOne({ _id: skillId, userId })
  if (!skill) return

  // max level — no more XP
  if (skill.level >= 10) return

  skill.xp += xpToAdd

  // ── Check level up loop — can level up multiple times ──────────
  while (skill.level < 10) {
    const threshold = XP_THRESHOLDS[skill.level]
    if (skill.xp >= threshold) {
      skill.xp -= threshold       // carry over remaining XP
      skill.level += 1
      skill.tier = getTierFromLevel(skill.level)
      skill.xpToNextLevel = XP_THRESHOLDS[skill.level] || 0

      // ── Create level up notification ───────────────────────────
      await Notification.create({
        userId,
        type: 'skill_levelup',
        message: `Your ${skill.name} skill reached level ${skill.level}!`,
        link: `/skills/${skill._id}`,
        metadata: {
          skillId: skill._id,
          skillName: skill.name,
          newLevel: skill.level,
          newTier: skill.tier,
        },
      })
    } else {
      break // not enough XP for next level
    }
  }

  await skill.save()
}

// ── Remove XP from skill when session is deleted ───────────────────
export const removeXPFromSkill = async (
  skillId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  xpToRemove: number
): Promise<void> => {
  const skill = await Skill.findOne({ _id: skillId, userId })
  if (!skill) return

  // subtract XP — minimum 0
  skill.xp = Math.max(0, skill.xp - xpToRemove)

  // recalculate level from scratch based on total XP
  // simpler approach — just reduce level if XP goes below 0
  // XP can't go below 0 so level stays — this is by design
  // users don't lose levels when deleting sessions

  await skill.save()
}