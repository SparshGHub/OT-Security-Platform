import { Router } from 'express';

// Thermal resources
const DRUM_LVL_SP = 'reg:41010';
const TURB_LOAD_SP = 'reg:42001';

export function simulateRouter() {
  const r = Router();

  // Simulate Drum Level SP write (default allowed role BOILER-HMI)
  r.post('/modbus-write-drum', async (req, res) => {
    const {
      site_id = 'plant-thermal-demo',
      src_ip = '10.10.1.25',
      dst_ip = '10.10.1.50',
      value = 55.0,                       // % setpoint
      src_role = 'BOILER-HMI',
      resource = DRUM_LVL_SP
    } = req.body || {};

    const evt = {
      ts: new Date().toISOString(),
      site_id,
      src: { ip: src_ip, role: src_role },
      dst: { ip: dst_ip },
      protocol: 'modbus',
      verb: 'write_register',
      resource,
      value
    };

    await fetch('http://localhost:8080/ingest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evt)
    });

    res.json({ ok: true });
  });

  // Simulate Turbine Load SP write (default allowed role TCS-HMI)
  r.post('/modbus-write-load', async (req, res) => {
    const {
      site_id = 'plant-thermal-demo',
      src_ip = '10.10.1.26',
      dst_ip = '10.10.1.60',
      value = 210.0,                      // MW setpoint
      src_role = 'TCS-HMI',
      resource = TURB_LOAD_SP
    } = req.body || {};

    const evt = {
      ts: new Date().toISOString(),
      site_id,
      src: { ip: src_ip, role: src_role },
      dst: { ip: dst_ip },
      protocol: 'modbus',
      verb: 'write_register',
      resource,
      value
    };

    await fetch('http://localhost:8080/ingest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evt)
    });

    res.json({ ok: true });
  });

  return r;
}

