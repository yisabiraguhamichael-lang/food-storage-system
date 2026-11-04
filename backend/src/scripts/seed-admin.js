import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

async function seedAdmin() {
  console.log("Starting admin seed...");
  const email    = process.env.ADMIN_EMAIL    || "admin@freshkeep.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name     = process.env.ADMIN_NAME     || "System Administrator";
  const contact  = process.env.ADMIN_CONTACT  || "+250788000000";

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    console.log("Admin already exists:", email);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (full_name, email, contact, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, email, contact, hash, "admin"]
  );
  console.log("Admin created:", email, "/", password);
}

seedAdmin()
  .catch((err) => { console.error("Seed failed:", err.message); process.exitCode = 1; })
  .finally(() => pool.end());
