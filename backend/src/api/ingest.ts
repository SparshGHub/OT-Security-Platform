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

    const alert = {
      site_id: evt.site_id,
      first_ts: evt.ts,
      last_ts: evt.ts,
      resource: evt.resource,
      decision: fused.decision,
      severity: fused.severity,
      reason: fused.reason,
      status: 'open' as const,
      count: 1
    };

    await pool.query(
      `INSERT INTO alerts (site_id, first_ts, last_ts, resource, decision, severity, reason, status, count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [alert.site_id, alert.first_ts, alert.last_ts, alert.resource, alert.decision, alert.severity, alert.reason, alert.status, alert.count]
    );

    broadcast({ type: 'alert', data: alert });
    res.json({ ok: true, decision: fused.decision, reason: fused.reason });
  });

  return r;
}

