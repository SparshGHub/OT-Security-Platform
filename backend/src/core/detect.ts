import type { COE } from './coe';

// Simple in-memory reputation lists (persist later if needed)
const knownBad = new Set<string>();                    // key: src_ip
const knownGood = new Set<string>();                   // key: `${src_ip}|${resource}`
const key = (ip?: string, res?: string) => (ip && res) ? `${ip}|${res}` : '';

export function repDecision(evt: COE) {
  if (evt.src.ip && knownBad.has(evt.src.ip))
    return { decision: 'BLOCK' as const, reason: 'denylist source' };
  if (evt.src.ip && knownGood.has(key(evt.src.ip, evt.resource)))
    return { decision: 'ALLOW' as const, reason: 'allowlist hit' };
  return null;
}

// Week-1 policies for water demo
export function policyDecision(evt: COE) {
  // P1: Only HMI may write chlorine setpoint (reg:40012)
  if (evt.protocol === 'modbus' && evt.verb === 'write_register' && evt.resource === 'reg:40012') {
    if ((evt.src.role || '').toUpperCase() !== 'HMI') {
      return { decision: 'BLOCK' as const, reason: 'Only HMI may write chlorine setpoint' };
    }
  }
  // P2: Large jump > 0.2 is suspicious (baseline ~2.0 for demo)
  if (evt.protocol === 'modbus' && evt.verb === 'write_register' && evt.resource === 'reg:40012') {
    const v = typeof evt.value === 'number' ? evt.value : null;
    if (v !== null && Math.abs(v - 2.0) > 0.2) {
      return { decision: 'ALERT' as const, reason: 'Large setpoint change Δ>0.2' };
    }
  }
  return null;
}

export function fuseDecision(evt: COE) {
  const r = repDecision(evt);
  if (r?.decision === 'BLOCK') return { decision: 'BLOCK' as const, severity: 'high' as const, reason: r.reason };
  const p = policyDecision(evt);
  if (p?.decision === 'BLOCK') return { decision: 'BLOCK' as const, severity: 'high' as const, reason: p.reason };
  if (p?.decision === 'ALERT') return { decision: 'ALERT' as const, severity: 'medium' as const, reason: p.reason };
  if (r?.decision === 'ALLOW') return { decision: 'ALLOW' as const, severity: 'low' as const, reason: r.reason };
  return { decision: 'ALLOW' as const, severity: 'low' as const, reason: 'no policy matched' };
}

