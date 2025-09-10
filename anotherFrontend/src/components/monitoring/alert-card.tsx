import type { Alert } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
}

const severityConfig = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const decisionConfig = {
  ALLOW: 'text-green-400',
  ALERT: 'text-yellow-400',
  BLOCK: 'text-red-400',
};

export default function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="p-4 border-b border-border/60 last:border-b-0">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <p className="font-medium text-sm text-foreground">{alert.reason}</p>
          <p className="font-mono text-xs text-muted-foreground">{alert.resource}</p>
        </div>
        <Badge className={cn('whitespace-nowrap', severityConfig[alert.severity])}>
          {alert.severity}
        </Badge>
      </div>
      <div className="flex justify-between items-end mt-2">
        <span className={cn('font-semibold text-sm', decisionConfig[alert.decision])}>
          {alert.decision}
        </span>
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          {alert.count && <span>Count: {alert.count}</span>}
          <span>
            {alert.last_ts && formatDistanceToNow(new Date(alert.last_ts), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
