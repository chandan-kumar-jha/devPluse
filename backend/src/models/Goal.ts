import mongoose, { Schema, Document, Types } from "mongoose";

interface IMilestone {
  text: string;
  completed: boolean;
}

export interface IGoal extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  targetDate?: Date;
  status: "active" | "completed" | "abandoned";
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    text: { type: String, required: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const goalSchema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    targetDate: { type: Date },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);