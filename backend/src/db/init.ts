import { pool } from './client';

/**
 * Initializes schema, deduplicates existing alerts, then enforces
 * one-row-per-(site_id, resource, decision, severity).
 *
 * This lets your current UPSERT in ingest.ts work as intended:
 * - Repeated (same decision+severity) => bumps count/last_ts/reason
 * - Different severities => separate rows (no collision)
 */
const INIT_SQL = `
-- 1) Base tables
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  site_id TEXT NOT NULL,
  src_ip TEXT,
  dst_ip TEXT,
  protocol TEXT NOT NULL,
  verb TEXT NOT NULL,
  resource TEXT NOT NULL,
  value_num DOUBLE PRECISION,
  value_text TEXT,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_site_ts ON events(site_id, ts);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  first_ts TIMESTAMPTZ NOT NULL,
  last_ts TIMESTAMPTZ NOT NULL,
  resource TEXT NOT NULL,
  decision TEXT NOT NULL,
  severity TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  count INT NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_alerts_site_last ON alerts(site_id, last_ts);

-- 2) Deduplicate existing rows BEFORE adding the unique index.
--    Keep the newest (by last_ts, then id) and merge: count=sum, first_ts=min, last_ts=max
WITH ranked AS (
  SELECT
    id, site_id, resource, decision, severity,
    first_ts, last_ts, reason, status, count,
    ROW_NUMBER() OVER (
      PARTITION BY site_id, resource, decision, severity
      ORDER BY last_ts DESC, id DESC
    ) AS rn,
    SUM(count) OVER (
      PARTITION BY site_id, resource, decision, severity
    ) AS sum_count,
    MIN(first_ts) OVER (
      PARTITION BY site_id, resource, decision, severity
    ) AS min_first,
    MAX(last_ts) OVER (
      PARTITION BY site_id, resource, decision, severity
    ) AS max_last
  FROM alerts
),
upd AS (
  UPDATE alerts a
  SET count = r.sum_count,
      first_ts = r.min_first,
      last_ts = r.max_last
  FROM ranked r
  WHERE a.id = r.id AND r.rn = 1
  RETURNING a.id
)
DELETE FROM alerts a
USING ranked r
WHERE a.id = r.id AND r.rn > 1;

-- 3) Enforce one row per (site, resource, decision, severity)
CREATE UNIQUE INDEX IF NOT EXISTS uk_alerts_site_res_dec_sev
  ON alerts(site_id, resource, decision, severity);
`;

export async function ensureSchema() {
  await pool.query(INIT_SQL);
}

