import mongoose, { Document, Schema } from 'mongoose'

// ── Tier type ──────────────────────────────────────────────────────
export type SkillTier = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// ── Category type ──────────────────────────────────────────────────
export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'DevOps'
  | 'Database'
  | 'Mobile'
  | 'AI/ML'
  | 'Security'
  | 'Testing'
  | 'System Design'
  | 'Other'

// ── TypeScript interface ───────────────────────────────────────────
export interface ISkill extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  category: SkillCategory
  level: number
  tier: SkillTier
  xp: number
  xpToNextLevel: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ── XP thresholds per level ────────────────────────────────────────
// level 1→2 needs 60 XP, level 9→10 needs 600 XP
export const XP_THRESHOLDS: Record<number, number> = {
  1: 60,
  2: 120,
  3: 180,
  4: 240,
  5: 300,
  6: 360,
  7: 420,
  8: 480,
  9: 540,
  10: 0, // max level — no more XP needed
}

// ── Calculate tier from level ──────────────────────────────────────
export const getTierFromLevel = (level: number): SkillTier => {
  if (level <= 3) return 'beginner'
  if (level <= 6) return 'intermediate'
  if (level <= 8) return 'advanced'
  return 'expert'
}

// ── Schema ─────────────────────────────────────────────────────────
const skillSchema = new Schema<ISkill>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Frontend',
          'Backend',
          'DevOps',
          'Database',
          'Mobile',
          'AI/ML',
          'Security',
          'Testing',
          'System Design',
          'Other',
        ],
        message: 'Invalid category',
      },
    },
    level: {
      type: Number,
      default: 1,
      min: [1, 'Level cannot be less than 1'],
      max: [10, 'Level cannot exceed 10'],
    },
    tier: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    xpToNextLevel: {
      type: Number,
      default: 60, // XP needed to go from level 1 → 2
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be at most 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ────────────────────────────────────────────────────────
skillSchema.index({ userId: 1 })
skillSchema.index({ userId: 1, category: 1 })
skillSchema.index({ userId: 1, tier: 1 })

// ── Unique skill name per user (case-insensitive) ──────────────────
skillSchema.index(
  { userId: 1, name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }, // case-insensitive
  }
)

export const Skill = mongoose.model<ISkill>('Skill', skillSchema)