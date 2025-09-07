import type { COE } from './coe';

// Simple in-memory reputation (expand later if needed)
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

// === Thermal Power Plant critical points ===
const DRUM_LVL_SP = 'reg:41010';        // Boiler drum level setpoint (%)
const TURB_LOAD_SP = 'reg:42001';       // Turbine load setpoint (MW)
const DRUM_BASELINE = 50.0;             // demo baseline (%)
const DRUM_DELTA = 5.0;                 // threshold (%)
const LOAD_NOMINAL = 200.0;             // demo nominal (MW)
const LOAD_DELTA = 10.0;                // threshold (MW)

export function policyDecision(evt: COE) {
  // P1: Only BOILER-HMI may write Drum Level SP
  if (evt.protocol === 'modbus' && evt.verb === 'write_register' && evt.resource === DRUM_LVL_SP) {
    if ((evt.src.role || '').toUpperCase() !== 'BOILER-HMI') {
      return { decision: 'BLOCK' as const, reason: 'Only BOILER-HMI may write Drum Level SP' };
    }
    const v = typeof evt.value === 'number' ? evt.value : null;
    if (v !== null && Math.abs(v - DRUM_BASELINE) > DRUM_DELTA) {
      return { decision: 'ALERT' as const, reason: `Large Drum Level SP change Δ>${DRUM_DELTA}%` };
    }
  }

  // P3/P4: Turbine Load SP controls
  if (evt.protocol === 'modbus' && evt.verb === 'write_register' && evt.resource === TURB_LOAD_SP) {
    if ((evt.src.role || '').toUpperCase() !== 'TCS-HMI') {
      return { decision: 'BLOCK' as const, reason: 'Only TCS-HMI may write Turbine Load SP' };
    }
    const v = typeof evt.value === 'number' ? evt.value : null;
    if (v !== null && Math.abs(v - LOAD_NOMINAL) > LOAD_DELTA) {
      return { decision: 'ALERT' as const, reason: `Large Turbine Load SP change Δ>${LOAD_DELTA} MW` };
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

