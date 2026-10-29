// src/services/userService.js
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";

const SALT_ROUNDS = 10;

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ?? null;
};

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0] ?? null;
};

// INSERT user baru dengan password terenkripsi dan token verifikasi
export const registerUser = async ({ fullname, username, password, email }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = uuidv4();
  const [result] = await pool.query(
    "INSERT INTO users (fullname, username, password, email, verification_token) VALUES (?, ?, ?, ?, ?)",
    [fullname, username, hashedPassword, email, verificationToken]
  );
  return {
    user: { id: result.insertId, fullname, username, email },
    verificationToken,
  };
};

// Cek email dan password; kembalikan user kalau cocok, null kalau tidak
export const verifyLogin = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
};

// Cari token di database; kalau ketemu tandai email terverifikasi
export const verifyEmailToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE verification_token = ?",
    [token]
  );
  if (rows.length === 0) return false;
  await pool.query(
    "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
    [rows[0].id]
  );
  return true;
};