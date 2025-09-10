export type Alert = {
  site_id?: string;
  first_ts?: string;
  last_ts: string;
  resource: string;
  decision: "ALLOW" | "ALERT" | "BLOCK";
  severity: "low" | "medium" | "high";
  reason: string;
  status?: "open" | "closed";
  count?: number;
};

export type DrumSimulation = {
  value: number;
  src_role: "BOILER-HMI" | "EWS";
  site_id?: string;
};

export type LoadSimulation = {
  value: number;
  src_role: "TCS-HMI" | "EWS";
  site_id?: string;
};

export type WebSocketMessage = {
  type: "alert";
  data: Alert;
};
