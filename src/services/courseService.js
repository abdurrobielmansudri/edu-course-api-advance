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

// Kolom yang boleh dipakai untuk sorting
const SORTABLE = ["id", "title", "price", "total_modules", "duration_minutes"];

// Ambil hanya kolom yang diizinkan dari body request
export const pickColumns = (data) =>
  Object.fromEntries(
    Object.entries(data ?? {}).filter(([key]) => COLUMNS.includes(key))
  );

// SELECT * FROM courses [WHERE ...] [ORDER BY ...]
export const getAllCourses = async ({ topic, search, sortBy, order } = {}) => {
  const conditions = [];
  const params = [];

  // Filter: WHERE category_id = ?
  if (topic) {
    conditions.push("category_id = ?");
    params.push(String(topic));
  }

  // Search: WHERE title LIKE ? OR description LIKE ?
  if (search) {
    conditions.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${String(search)}%`, `%${String(search)}%`);
  }

  let sql = `SELECT * FROM ${TABLE}`;
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sort: ORDER BY kolom ASC/DESC (hanya kolom yang diizinkan)
  if (sortBy && SORTABLE.includes(sortBy)) {
    const direction = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
    sql += ` ORDER BY ${sortBy} ${direction}`;
  }

  const [rows] = await pool.query(sql, params);
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