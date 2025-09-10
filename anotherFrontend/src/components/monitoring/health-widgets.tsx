'use client';

import { useMemo } from 'react';
import type { Alert } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HealthWidgetsProps {
  initialAlerts: Alert[];
}

function StatCard({ title, value, icon, description }: { title: string; value: string | number; icon: React.ReactNode, description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function HealthWidgets({ initialAlerts }: HealthWidgetsProps) {
  const { allAlerts, lastAlertTimestamp } = useAppContext();
  
  // Combine initial alerts with live alerts, ensuring no duplicates
  const combinedAlerts = useMemo(() => {
    const alerts = [...allAlerts];
    const liveAlertResources = new Set(alerts.map(a => a.resource + a.last_ts));
    initialAlerts.forEach(initial => {
        if (!liveAlertResources.has(initial.resource + initial.last_ts)) {
            alerts.push(initial);
        }
    });
    return alerts;
  }, [allAlerts, initialAlerts]);

  const stats = useMemo(() => {
    return combinedAlerts.reduce(
      (acc, alert) => {
        if (alert.decision === 'BLOCK') acc.block++;
        else if (alert.decision === 'ALERT') acc.alert++;
        else if (alert.decision === 'ALLOW') acc.allow++;
        return acc;
      },
      { block: 0, alert: 0, allow: 0 }
    );
  }, [combinedAlerts]);
  
  const lastAlertTime = lastAlertTimestamp || (initialAlerts.length > 0 ? initialAlerts[0].last_ts : null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Last Alert" 
        value={lastAlertTime ? formatDistanceToNow(new Date(lastAlertTime), { addSuffix: true }) : 'Never'} 
        icon={<Clock className="h-4 w-4 text-muted-foreground" />} 
        description={lastAlertTime ? new Date(lastAlertTime).toLocaleString() : 'No alerts received yet'}
      />
      <StatCard title="Blocks" value={stats.block} icon={<ShieldX className="h-4 w-4 text-red-500" />} />
      <StatCard title="Alerts" value={stats.alert} icon={<ShieldAlert className="h-4 w-4 text-yellow-500" />} />
      <StatCard title="Allows" value={stats.allow} icon={<ShieldCheck className="h-4 w-4 text-green-500" />} />
    </div>
  );
}
