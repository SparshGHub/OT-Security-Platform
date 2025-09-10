import type { Alert } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecentAlertsTableProps {
  initialAlerts: Alert[];
  error: string | null;
}

const severityConfig: Record<Alert['severity'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const decisionConfig: Record<Alert['decision'], string> = {
  ALLOW: 'text-green-400',
  ALERT: 'text-yellow-400',
  BLOCK: 'text-red-400',
};

export default function RecentAlertsTable({ initialAlerts, error }: RecentAlertsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>
          A log of the last 20 events recorded in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-center p-8">{error}</div>
        ) : initialAlerts.length === 0 ? (
          <div className="text-muted-foreground text-center p-8">No recent alerts found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialAlerts.map((alert, index) => (
                <TableRow key={`${alert.resource}-${alert.last_ts}-${index}`}>
                  <TableCell className="text-muted-foreground text-xs">
                    {alert.last_ts && format(new Date(alert.last_ts), 'PPpp')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{alert.resource}</TableCell>
                  <TableCell>{alert.reason}</TableCell>
                  <TableCell className={cn('font-semibold', decisionConfig[alert.decision])}>
                    {alert.decision}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(severityConfig[alert.severity])}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
