import { pool } from './src/db.js';

const r = await pool.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`);
console.table(r.rows);
await pool.end();