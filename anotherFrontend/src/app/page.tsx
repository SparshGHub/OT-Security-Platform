import type { Alert } from '@/lib/types';
import { getAlerts } from '@/lib/api';
import LiveAlerts from '@/components/monitoring/live-alerts';
import HealthWidgets from '@/components/monitoring/health-widgets';
import RecentAlertsTable from '@/components/monitoring/recent-alerts-table';
import TrendChart from '@/components/monitoring/trend-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const revalidate = 0; // Ensure data is fresh on every request

export default async function MonitorPage() {
  let recentAlerts: Alert[] = [];
  let error: string | null = null;
  try {
    recentAlerts = await getAlerts(20);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch recent alerts.';
    console.error(e);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <LiveAlerts initialAlerts={recentAlerts} />
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <HealthWidgets initialAlerts={recentAlerts} />

        <Card>
          <CardHeader>
            <CardTitle>Alert Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>

        <RecentAlertsTable initialAlerts={recentAlerts} error={error} />
      </div>
    </div>
  );
}
