// src/routes/courseRoutes.js
import { Router } from "express";
import * as courseService from "../services/courseService.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET /course -> semua kelas
router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const courses = await courseService.getAllCourses(req.query);
    res.json(courses);
  })
);

// GET /course/:id -> satu kelas
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
    res.json(course);
  })
);

// POST /course -> tambah kelas
router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (Object.keys(courseService.pickColumns(req.body)).length === 0) {
      return res.status(400).json({ message: "Data kelas tidak valid atau kosong" });
    }
    const created = await courseService.insertCourse(req.body);
    res.status(201).json(created);
  })
);

// PATCH /course/:id -> ubah sebagian data kelas
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    if (Object.keys(courseService.pickColumns(req.body)).length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang diubah" });
    }
    const updated = await courseService.updateCourse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
    res.json(updated);
  })
);

// DELETE /course/:id -> hapus kelas
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await courseService.deleteCourse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
    res.json({ message: "Kelas berhasil dihapus" });
  })
);

export default router;