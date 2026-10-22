// src/services/courseService.js
// Semua query SQL (DML) ada di sini.
import pool from "../config/db.js";

const TABLE = "courses";

// Kolom yang boleh diisi/diubah lewat API (id tidak dimasukkan karena otomatis).
const COLUMNS = [
  "title",
  "description",
  "price",
  "tutor_id",
  "category_id",
  "image",
  "badge",
  "total_modules",
  "duration_minutes",
];

// Ambil hanya kolom yang diizinkan dari body request
export const pickColumns = (data) =>
  Object.fromEntries(
    Object.entries(data ?? {}).filter(([key]) => COLUMNS.includes(key))
  );

// SELECT * FROM courses
export const getAllCourses = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE}`);
  return rows;
};

// SELECT * FROM courses WHERE id = ?
export const getCourseById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
  return rows[0] ?? null;
};

// INSERT INTO courses SET ...
export const insertCourse = async (data) => {
  const values = pickColumns(data);
  const [result] = await pool.query(`INSERT INTO ${TABLE} SET ?`, [values]);
  return getCourseById(result.insertId);
};

// UPDATE courses SET ... WHERE id = ?
export const updateCourse = async (id, data) => {
  const values = pickColumns(data);
  const [result] = await pool.query(`UPDATE ${TABLE} SET ? WHERE id = ?`, [
    values,
    id,
  ]);
  if (result.affectedRows === 0) return null; // id tidak ditemukan
  return getCourseById(id);
};

// DELETE FROM courses WHERE id = ?
export const deleteCourse = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};