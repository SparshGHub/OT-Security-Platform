import { useEffect, useState } from 'react';
import { connectWS } from '../lib/ws';

type Alert = {
  decision: string;
  severity: string;
  reason: string;
  resource?: string;
  last_ts?: string;
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const ws = connectWS((msg) => {
      if (msg.type === 'alert') setAlerts((a) => [msg.data, ...a].slice(0, 50));
    });
    return () => ws.close();
  }, []);

  return (
    <div className="card">
      <h3>Live Alerts</h3>
      <div className="list">
        {alerts.map((a, i) => (
          <div key={i} className="card" style={{ padding: 8 }}>
            <div>
              <span className="badge">{a.severity}</span>{' '}
              <strong>{a.decision}</strong> · {a.resource || '-'}
            </div>
            <div style={{ fontSize: 14, color: '#374151' }}>{a.reason}</div>
          </div>
        ))}
        {alerts.length === 0 && <div style={{ color: '#6b7280' }}>No alerts yet</div>}
      </div>
    </div>
  );
}

