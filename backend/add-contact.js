import 'dotenv/config';
import { pool } from './src/db.js';

try {
  const before = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('BEFORE:', before.rows.map(r => `${r.column_name} (${r.data_type})`));

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(255)`);

  const after = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('AFTER :', after.rows.map(r => `${r.column_name} (${r.data_type})`));
} catch (e) {
  console.error('Migration failed:', e.message);
} finally {
  await pool.end();
}import 'dotenv/config';
import { pool } from './src/db.js';

try {
  const before = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('BEFORE:', before.rows.map(r => `${r.column_name} (${r.data_type})`));

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(255)`);

  const after = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('AFTER :', after.rows.map(r => `${r.column_name} (${r.data_type})`));
} catch (e) {
  console.error('Migration failed:', e.message);
} finally {
  await pool.end();
}