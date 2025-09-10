export async function getAlerts(limit = 20) {
  const res = await fetch(`http://localhost:8080/alerts?limit=${limit}`);
  return res.json();
}

export async function simulateDrumSetpoint(value: number, role = 'BOILER-HMI') {
  return fetch('http://localhost:8080/simulate/modbus-write-drum', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, src_role: role })
  });
}

export async function simulateTurbineLoad(value: number, role = 'TCS-HMI') {
  return fetch('http://localhost:8080/simulate/modbus-write-load', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, src_role: role })
  });
}

