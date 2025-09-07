import { Router } from 'express';
import { pool } from '../db/client';

export function alertsRouter() {
  const r = Router();
  r.get('/', async (req, res) => {
    const limit = Number(req.query.limit || 20);
    const { rows } = await pool.query(
      `SELECT site_id, last_ts, resource, decision, severity, reason, status, count
       FROM alerts ORDER BY last_ts DESC LIMIT $1`,
      [limit]
    );
    res.json(rows);
  });
  return r;
}

