-- ============================================================================
-- Food Storage — Database Schema (idempotent)
-- Safe to run repeatedly: CREATE ... IF NOT EXISTS + ALTER ... IF NOT EXISTS
-- Run with:  node src/initDb.js
-- ============================================================================

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  contact       VARCHAR(40)  NOT NULL DEFAULT '',
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('admin', 'customer')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Backfill for older databases that pre-date the contact / role columns.
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(40) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role    VARCHAR(20) NOT NULL DEFAULT 'customer'
  CHECK (role IN ('admin', 'customer'));

-- ----------------------------------------------------------------------------
-- food_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_items (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(150)  NOT NULL,
  category         VARCHAR(80)   NOT NULL DEFAULT 'Other',
  quantity         NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit             VARCHAR(40)   NOT NULL DEFAULT 'items',
  storage_location VARCHAR(100)  NOT NULL DEFAULT 'Fridge',
  stored_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
  expiry_date      DATE          NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_food_expiry ON food_items (expiry_date);

-- ----------------------------------------------------------------------------
-- sensor_readings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor_readings (
  id              BIGSERIAL PRIMARY KEY,
  temperature_c   NUMERIC(6,2),
  humidity_pct    NUMERIC(6,2)
                  CHECK (humidity_pct IS NULL OR humidity_pct BETWEEN 0 AND 100),
  air_quality_ppm NUMERIC(10,2),
  device_id       VARCHAR(100) NOT NULL DEFAULT 'esp32-storage-01',
  recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sensor_time ON sensor_readings (recorded_at DESC);