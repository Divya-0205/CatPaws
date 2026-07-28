import mongoose, { Schema, Document, Types } from "mongoose";

export type ReviewSource = "upload" | "snippet" | "github";

export interface IReview extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId;
  fileName?: string;
  source: ReviewSource;
  sourceRef?: string; // the uploaded file's storedFileName, or the github URL — helps re-open past reviews
  code: string;
  Score: number;
  feedback: string;
  improvement: string[];
  correctedCode:string;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    user: { type: Types.ObjectId, required: true, ref: "User" },
    project: { type: Types.ObjectId, required: true, ref: "Project" },
    fileName: { type: String },
    source: { type: String, enum: ["upload", "snippet", "github"], default: "snippet" },
    sourceRef: { type: String },
    code: { type: String, required: true },
    Score: { type: Number, required: true, min: 0, max: 100 },
    feedback: { type: String, required: true },
    improvement: { type: [String], required: true },
    correctedCode:{type: String , required: true},
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", ReviewSchema);