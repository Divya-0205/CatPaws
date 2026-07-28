import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Make sure the uploads folder exists before multer tries to write to it
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Extensions we're willing to accept and treat as source code
const ALLOWED_EXTENSIONS = new Set([
  ".py",
  ".cpp",
  ".cc",
  ".c",
  ".h",
  ".hpp",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".java",
  ".go",
  ".rb",
  ".php",
  ".cs",
  ".rs",
  ".swift",
  ".kt",
  ".m",
  ".scala",
  ".sql",
  ".html",
  ".css",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Prefix with a timestamp so two people uploading "index.js" don't collide,
    // and strip anything that isn't a safe filename character
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type "${ext}" isn't supported. Please upload a source code file.`));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB cap, plenty for source files
  },
});

export const UPLOADS_DIR = UPLOAD_DIR;