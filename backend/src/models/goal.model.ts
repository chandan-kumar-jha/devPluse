import mongoose, { Document, Schema } from 'mongoose'

// ── Milestone interface ────────────────────────────────────────────
export interface IMilestone {
  _id: mongoose.Types.ObjectId
  title: string
  completed: boolean
  order: number
}

// ── Goal interface ─────────────────────────────────────────────────
export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  deadline?: Date
  status: 'active' | 'done' | 'archived'
  progress: number
  pinned: boolean
  category?: string
  sessionCount: number
  milestones: IMilestone[]
  createdAt: Date
  updatedAt: Date
}

// ── Milestone subdocument schema ───────────────────────────────────
const milestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [120, 'Milestone title must be at most 120 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    _id: true, // each milestone gets its own _id for toggle by id
  }
)

// ── Goal schema ────────────────────────────────────────────────────
const goalSchema = new Schema<IGoal>(
  {
    // ── Core ──────────────────────────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },

    // ── Status ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['active', 'done', 'archived'],
        message: 'Status must be active, done or archived',
      },
      default: 'active',
    },

    // ── Progress — never set manually, always calculated ──────────
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Dashboard ─────────────────────────────────────────────────
    pinned: {
      type: Boolean,
      default: false,
    },

    // ── Optional ──────────────────────────────────────────────────
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category must be at most 50 characters'],
      default: null,
    },
    sessionCount: {
      type: Number,
      default: 0,
    },

    // ── Milestones — embedded array ────────────────────────────────
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ────────────────────────────────────────────────────────
goalSchema.index({ userId: 1 })
goalSchema.index({ userId: 1, status: 1 })
goalSchema.index({ userId: 1, pinned: 1 })
goalSchema.index({ userId: 1, deadline: 1 })

// ── Auto calculate progress from milestones ────────────────────────
export const calculateProgress = (milestones: IMilestone[]): number => {
  if (!milestones || milestones.length === 0) return 0
  const completed = milestones.filter((m) => m.completed).length
  return Math.round((completed / milestones.length) * 100)
}

export const Goal = mongoose.model<IGoal>('Goal', goalSchema)