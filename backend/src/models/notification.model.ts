import mongoose, { Document, Schema } from 'mongoose'

// ── Notification type ──────────────────────────────────────────────
export type NotificationType =
  | 'skill_levelup'
  | 'goal_deadline'
  | 'goal_completed'
  | 'streak_broken'
  | 'security_alert'

// ── TypeScript interface ───────────────────────────────────────────
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: NotificationType
  message: string
  read: boolean
  link?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// ── Schema ─────────────────────────────────────────────────────────
const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: [
          'skill_levelup',
          'goal_deadline',
          'goal_completed',
          'streak_broken',
          'security_alert',
        ],
        message: 'Invalid notification type',
      },
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [200, 'Message must be at most 200 characters'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only need createdAt
  }
)

// ── Indexes ────────────────────────────────────────────────────────
// fetch all notifications for a user — most common query
notificationSchema.index({ userId: 1, createdAt: -1 })

// fetch only unread notifications for badge count
notificationSchema.index({ userId: 1, read: 1 })

// ── TTL index — auto delete notifications after 30 days ───────────
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days in seconds
)

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
)