import mongoose, { Document, Schema, CallbackWithoutResultAndOptionalError } from 'mongoose'

// ── TypeScript interface ───────────────────────────────────────────
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  duration: number
  date: Date
  notes?: string
  tags?: string[]
  goalId?: mongoose.Types.ObjectId
  skillId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// ── Schema ─────────────────────────────────────────────────────────
const sessionSchema = new Schema<ISession>(
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
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    // ── Optional ──────────────────────────────────────────────────
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must be at most 2000 characters'],
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: 'Maximum 10 tags allowed',
      },
    },

    // ── Links ─────────────────────────────────────────────────────
    goalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ────────────────────────────────────────────────────────
// every query starts with userId — most important index
sessionSchema.index({ userId: 1 })

// dashboard aggregation — group by date per user
sessionSchema.index({ userId: 1, date: -1 })

// filter by tag per user
sessionSchema.index({ userId: 1, tags: 1 })

// keyword search on title and notes
sessionSchema.index(
  { title: 'text', notes: 'text' },
  { weights: { title: 10, notes: 5 } } // title matches ranked higher
)

//  ── Sanitise tags before save ──────────────────────────────────────
// sessionSchema.pre('validate', function (this: ISession, next: any) {
//   if (this.tags && this.tags.length > 0) {
//     this.tags = [...new Set(this.tags.map((tag) => tag.toLowerCase().trim()))]
//   }
//   next()
// })

export const Session = mongoose.model<ISession>('Session', sessionSchema)