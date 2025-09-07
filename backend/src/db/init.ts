import { pool } from './client';

const INIT_SQL = `
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
  resource TEXT,
  decision TEXT NOT NULL,
  severity TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  count INT NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_alerts_site_last ON alerts(site_id, last_ts);
`;

export async function ensureSchema() {
  await pool.query(INIT_SQL);
}

