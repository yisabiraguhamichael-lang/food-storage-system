# Node.js + PostgreSQL backend
1. In pgAdmin, connect to the `postgres` database and run `CREATE DATABASE food_storage_db;` (skip if it already exists).
2. In CMD: `copy .env.example .env`
3. Edit `.env`; set your PostgreSQL password and replace `JWT_SECRET` with a long, random secret.
4. Run `npm install`, then `npm run db:init`, then `npm run dev`.
5. Test `http://localhost:5000/api/health`; expected `{"ok":true,"database":"connected"}`.
6. Open the frontend, register an account, then use that account to log in. A new database has no accounts yet.
7. Admin accounts cannot be created through public registration. To promote an account, an administrator can run `UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';` after it has been registered.
8. In a second CMD window in this folder run `npm run simulate` to insert simulated sensor readings every 5 seconds. Ctrl+C stops it.

API: POST `/api/auth/register`, POST `/api/auth/login`, GET/POST `/api/food-items`, GET/PUT/DELETE `/api/food-items/:id`, GET `/api/sensors/latest`, GET `/api/sensors?limit=50`, POST `/api/sensors`.
POST sensor example: `{"temperature_c":4.8,"humidity_pct":62,"air_quality_ppm":130,"device_id":"esp32-storage-01"}`.
The simulator values are generated test data, not real sensor readings. Calibrate MQ-135 for accurate air-quality ppm.