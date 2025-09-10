import type { Alert, DrumSimulation, LoadSimulation } from "@/lib/types";

// This will be set by the Docker build argument or the .env.local file.
// It will be the full URL to the backend API.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Could not read error response.');
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }
  // Handle cases where the response body might be empty
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // If parsing fails, return the raw text if it's not empty, otherwise an empty object
    return (text || {}) as T;
  }
}

export async function getAlerts(limit = 20): Promise<Alert[]> {
  if (!API_BASE) {
    throw new Error('The backend API URL is not configured. Please set NEXT_PUBLIC_API_BASE.');
  }
  const response = await fetch(`${API_BASE}/alerts?limit=${limit}`, { cache: 'no-store' });
  return handleResponse<Alert[]>(response);
}

export async function simulateDrum(data: Omit<DrumSimulation, 'site_id'>): Promise<any> {
  if (!API_BASE) {
    throw new Error('The backend API URL is not configured. Please set NEXT_PUBLIC_API_BASE.');
  }
  const body: DrumSimulation = { ...data, site_id: "Thermal - Demo" };
  const response = await fetch(`${API_BASE}/simulate/modbus-write-drum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function simulateLoad(data: Omit<LoadSimulation, 'site_id'>): Promise<any> {
  if (!API_BASE) {
    throw new Error('The backend API URL is not configured. Please set NEXT_PUBLIC_API_BASE.');
  }
  const body: LoadSimulation = { ...data, site_id: "Thermal - Demo" };
  const response = await fetch(`${API_BASE}/simulate/modbus-write-load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

