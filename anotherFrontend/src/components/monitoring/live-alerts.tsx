'use client';

import { useEffect, useCallback } from 'react';
import type { Alert } from '@/lib/types';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AlertCard from './alert-card';

interface LiveAlertsProps {
  initialAlerts: Alert[];
}

export default function LiveAlerts({ initialAlerts }: LiveAlertsProps) {
  const { setWsStatus, allAlerts, addAlert } = useAppContext();

  const handleNewAlert = useCallback((newAlert: Alert) => {
    addAlert(newAlert);
  }, [addAlert]);

  const wsStatus = useWebSocket(handleNewAlert);

  useEffect(() => {
    setWsStatus(wsStatus);
  }, [wsStatus, setWsStatus]);
  
  useEffect(() => {
    // Set initial alerts into context only once
    if (initialAlerts.length > 0 && allAlerts.length === 0) {
      initialAlerts.forEach(alert => addAlert(alert));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] lg:h-[calc(100vh-22rem)]" aria-live="polite">
          {allAlerts.length > 0 ? (
            allAlerts.map((alert, index) => <AlertCard key={`${alert.resource}-${alert.last_ts}-${index}`} alert={alert} />)
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
              <p>No new alerts. <br/>Use the Simulation tab to generate events.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
