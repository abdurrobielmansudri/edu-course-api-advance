// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

// Cek token di header Authorization: Bearer <token>
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Autentikasi gagal, token tidak ditemukan" });
  }

  // Format header: "Bearer eyJhbGci..." -> ambil bagian tokennya saja
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // data user dari token, bisa dipakai di route berikutnya
    next();
  } catch (error) {
    return res.status(401).json({ message: "Autentikasi gagal, token tidak valid" });
  }
};