import mongoose, { Schema, Document, Types } from "mongoose";

// A pasted code snippet or a manually-added code entry (existing behavior, unchanged)
interface IProjectDocument {
  fileName: string;
  code: string;
  addedAt: Date;
}

// A real uploaded file, stored on disk, referenced here by path
interface IProjectFile {
  originalName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// A GitHub URL the user submitted for review
interface IProjectGithubLink {
  url: string;
  addedAt: Date;
}

export interface IProject extends Document {
  user: Types.ObjectId;
  name: string;
  description?: string;
  documents: IProjectDocument[];
  files: IProjectFile[];
  githubLinks: IProjectGithubLink[];
}

const projectSchema = new Schema<IProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    documents: [
      {
        fileName: { type: String, required: true },
        code: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    files: [
      {
        originalName: { type: String, required: true },
        storedFileName: { type: String, required: true },
        filePath: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    githubLinks: [
      {
        url: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", projectSchema);