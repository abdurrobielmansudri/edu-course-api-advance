// src/app.js
import "dotenv/config";
import express from "express";
import pool from "./config/db.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EduCourse API berjalan" });
});

app.use("/course", courseRoutes);

// Endpoint yang tidak ada
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Format JSON tidak valid" });
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "Data tidak bisa dihapus karena masih dipakai tabel lain",
    });
  }
  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

const PORT = process.env.PORT || 3000;

try {
  await pool.query("SELECT 1");
  console.log("Terhubung ke database MySQL");
} catch (error) {
  console.error("Gagal terhubung ke database:", error.message);
}

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});