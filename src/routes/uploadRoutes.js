// src/routes/uploadRoutes.js
import { Router } from "express";
import { upload } from "../services/uploadService.js";

const router = Router();

// POST /upload -> unggah satu gambar lewat field "file"
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File wajib diunggah (field: file)" });
  }
  res.status(201).json({
    message: "Upload berhasil",
    file: {
      filename: req.file.filename,
      size: req.file.size,
      url: `/upload/${req.file.filename}`,
    },
  });
});

export default router;
