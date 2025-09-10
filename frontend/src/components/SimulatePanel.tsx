import { useState } from 'react';
import { simulateDrumSetpoint, simulateTurbineLoad } from '../lib/api';

export default function SimulatePanel() {
  const [drumSP, setDrumSP] = useState(56.0);
  const [drumRole, setDrumRole] = useState('BOILER-HMI');

  const [loadSP, setLoadSP] = useState(215.0);
  const [loadRole, setLoadRole] = useState('TCS-HMI');

  return (
    <div className="card">
      <h3>Simulate</h3>

      <div className="row">
        <label>Drum Level SP (%)</label>
        <input
          type="number" step="0.1" value={drumSP}
          onChange={(e) => setDrumSP(parseFloat(e.target.value))}
        />
        <select value={drumRole} onChange={(e) => setDrumRole(e.target.value)}>
          <option>BOILER-HMI</option>
          <option>EWS</option>
        </select>
        <button className="btn" onClick={() => simulateDrumSetpoint(drumSP, drumRole)}>
          Write Drum SP (reg:41010)
        </button>
      </div>

      <div className="row">
        <label>Turbine Load SP (MW)</label>
        <input
          type="number" step="1" value={loadSP}
          onChange={(e) => setLoadSP(parseFloat(e.target.value))}
        />
        <select value={loadRole} onChange={(e) => setLoadRole(e.target.value)}>
          <option>TCS-HMI</option>
          <option>EWS</option>
        </select>
        <button className="btn" onClick={() => simulateTurbineLoad(loadSP, loadRole)}>
          Write Load SP (reg:42001)
        </button>
      </div>
    </div>
  );
}

