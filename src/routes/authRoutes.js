// src/routes/authRoutes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import * as userService from "../services/userService.js";
import { sendVerificationEmail } from "../services/mailService.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// POST /register -> daftar user baru dan kirim email verifikasi
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { fullname, username, password, email } = req.body ?? {};

    if (!fullname || !username || !password || !email) {
      return res
        .status(400)
        .json({ message: "fullname, username, password, dan email wajib diisi" });
    }
    if (await userService.findUserByEmail(email)) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }
    if (await userService.findUserByUsername(username)) {
      return res.status(409).json({ message: "Username sudah dipakai" });
    }

    const { user, verificationToken } = await userService.registerUser({
      fullname,
      username,
      password,
      email,
    });

    let emailPreview = null;
    try {
      emailPreview = await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error("Gagal mengirim email:", error.message);
    }

    res.status(201).json({
      message: "Registrasi berhasil, cek email untuk verifikasi",
      user,
      emailPreview,
    });
  })
);

// POST /login -> login dengan email dan password, balas dengan token JWT
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "email dan password wajib diisi" });
    }

    const user = await userService.verifyLogin(email, password);
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login berhasil", token });
  })
);

// GET /verify-email?token=... -> verifikasi email dari link di email
router.get(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token || !(await userService.verifyEmailToken(String(token)))) {
      return res.status(400).json({ message: "Invalid Verification Token" });
    }

    res.json({ message: "Email Verified Successfully" });
  })
);

export default router;