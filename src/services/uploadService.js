// src/services/uploadService.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Folder upload di root proyek (dibuat otomatis kalau belum ada)
const uploadDir = path.resolve("upload");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

// Hanya menerima file gambar, maksimal 2 MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Hanya file gambar yang diperbolehkan"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});