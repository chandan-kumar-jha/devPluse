import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISkill extends Document {
  user: Types.ObjectId;
  name: string;
  category: "language" | "framework" | "tool" | "concept" | "other";
  currentLevel: number;
  targetLevel?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: {
      type: String,
      enum: ["language", "framework", "tool", "concept", "other"],
      default: "other",
    },
    currentLevel: { type: Number, default: 0, min: 0, max: 100 },
    targetLevel: { type: Number, min: 0, max: 100 },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

skillSchema.index({ user: 1, name: 1 }, { unique: true });

export const Skill = mongoose.model<ISkill>("Skill", skillSchema);