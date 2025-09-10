'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { WebSocketStatus } from '@/hooks/use-websocket';

interface AppContextType {
  wsStatus: WebSocketStatus;
  setWsStatus: (status: WebSocketStatus) => void;
  lastAlertTimestamp: string | null;
  setLastAlertTimestamp: (ts: string | null) => void;
  allAlerts: any[];
  addAlert: (alert: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('connecting');
  const [lastAlertTimestamp, setLastAlertTimestamp] = useState<string | null>(null);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);

  const addAlert = (alert: any) => {
    setAllAlerts(prev => [alert, ...prev]);
    setLastAlertTimestamp(alert.last_ts || new Date().toISOString());
  };
  
  return (
    <AppContext.Provider value={{ wsStatus, setWsStatus, lastAlertTimestamp, setLastAlertTimestamp, allAlerts, addAlert }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
