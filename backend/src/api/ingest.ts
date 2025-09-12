import { Router } from 'express';
import { COESchema } from '../core/coe';
import { fuseDecision } from '../core/detect';
import { pool } from '../db/client';

export function ingestRouter(broadcast: (m: any) => void) {
  const r = Router();

  r.post('/', async (req, res) => {
    const parsed = COESchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const evt = parsed.data;
    const fused = fuseDecision(evt);

    // 1) Always record the raw event
    await pool.query(
      `INSERT INTO events (ts, site_id, src_ip, dst_ip, protocol, verb, resource, value_num, value_text, decision, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        evt.ts,
        evt.site_id,
        evt.src.ip || null,
        evt.dst?.ip || null,
        evt.protocol,
        evt.verb,
        evt.resource,
        typeof evt.value === 'number' ? evt.value : null,
        typeof evt.value === 'string' ? evt.value : null,
        fused.decision,
        fused.reason
      ]
    );

    // 2) Upsert into alerts (one row per (site,resource,decision,severity))
    const { rows } = await pool.query(
      `
      INSERT INTO alerts (site_id, first_ts, last_ts, resource, decision, severity, reason, status, count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (site_id, resource, decision, severity)
      DO UPDATE SET
        last_ts = EXCLUDED.last_ts,
        count   = alerts.count + 1,
        reason  = EXCLUDED.reason
      RETURNING *;
      `,
      [
        evt.site_id,
        evt.ts,
        evt.ts,
        evt.resource,
        fused.decision,
        fused.severity,
        fused.reason,
        'open',
        1
      ]
    );

    const savedAlert = rows[0];

    // 3) Broadcast what was actually stored
    broadcast({ type: 'alert', data: savedAlert });

    // 4) Respond to caller
    res.json({ ok: true, decision: fused.decision, reason: fused.reason });
  });

  return r;
}

