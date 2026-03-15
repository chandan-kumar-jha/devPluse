import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  user: Types.ObjectId;
  title: string;
  date: Date;
  durationMinutes: number;
  tags: string[];
  notes?: string;
  mood?: "great" | "good" | "okay" | "bad";
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    tags: [{ type: String, maxlength: 30 }],
    notes: { type: String, maxlength: 2000 },
    mood: { type: String, enum: ["great", "good", "okay", "bad"] },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, date: -1 });

export const Session = mongoose.model<ISession>("Session", sessionSchema);