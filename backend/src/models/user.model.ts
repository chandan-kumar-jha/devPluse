import mongoose, {Document , Schema } from "mongoose";


export interface IUser extends Document {

    // identity
    name:string
    username:string
    email:string

    // auth
    passwordHash: string
    isVerified: boolean
    otp?: string
    otpExpiry?: Date
    otpAttempts: number
    otpLastSent?: Date
    loginAttempts: number
    lockUntil?: Date
    provider: 'local' | 'google'

    // Profile
  bio?: string
  currentRole?: string
  avatarUrl?: string
  avatarPublicId?: string
  githubUsername?: string
  timezone: string

  // Streak
  currentStreak: number
  longestStreak: number
  lastSessionDate?: Date

  // Settings
  notificationPrefs: {
    skill_levelup: boolean
    goal_deadline: boolean
    streak_broken: boolean
  }
  privacySettings: {
    profileVisibility: 'public' | 'private'
    hideStats: boolean
  }

  // Timestamps (added by mongoose)
  createdAt: Date
  updatedAt: Date

  // Helper method
  isLocked(): boolean

}



const userSchema = new Schema<IUser>({
    name:{
        type:String,
        required:[true, 'name is required '],
        trime:true,
        minlength:[2,"Name must be at least 2 characters"],
        maxlength:[50, "Name must be at most 50 characters"]
    },

     username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers and underscores',
      ],
    },

     email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

     // ── Auth ──────────────────────────────────────────────────────
     passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSent: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },


     // ── Profile ───────────────────────────────────────────────────
    bio: {
      type: String,
      trim: true,
      maxlength: [160, 'Bio must be at most 160 characters'],
      default: null,
    },
    currentRole: {
      type: String,
      trim: true,
      maxlength: [80, 'Role must be at most 80 characters'],
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
     avatarPublicId: {
      type: String,
      default: null,
    },
    githubUsername: {
      type: String,
      trim: true,
      maxlength: [39, 'GitHub username must be at most 39 characters'],
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },

    // ── Streak ────────────────────────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastSessionDate: {
      type: Date,
      default: null,
    },

    // ── Settings ──────────────────────────────────────────────────
     notificationPrefs: {
      skill_levelup: { type: Boolean, default: true },
      goal_deadline: { type: Boolean, default: true },
      streak_broken: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
      },
      hideStats: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, // auto adds createdAt + updatedAt
  }
)


// ── Indexes ────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })

// ── Helper method — check if account is locked ────────────────────
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date())
}

/*
_doc → original mongoose document
ret → final JSON object (jo client ko bheja jayega)

👉 hum ret ko modify kar sakte hai

delete ret. ---->  “Client ko ye field mat bhejo”
*/
userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.passwordHash
    delete ret.otp
    delete ret.otpExpiry
    delete ret.otpAttempts
    delete ret.otpLastSent
    delete ret.loginAttempts
    delete ret.lockUntil
    delete ret.__v
    return ret
  },
})

export const User = mongoose.model<IUser>('User', userSchema)