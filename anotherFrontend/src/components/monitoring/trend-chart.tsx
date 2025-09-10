'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useAppContext } from '@/context/app-context';
import { endOfMinute, startOfMinute } from 'date-fns';

export default function TrendChart() {
  const { allAlerts } = useAppContext();

  const chartData = useMemo(() => {
    if (allAlerts.length === 0) return [];
    
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const filteredAlerts = allAlerts.filter(alert => new Date(alert.last_ts) > thirtyMinutesAgo);

    const buckets = new Map<string, { time: string; block: number; alert: number }>();

    filteredAlerts.forEach(alert => {
      const minuteStart = startOfMinute(new Date(alert.last_ts)).toISOString();

      if (!buckets.has(minuteStart)) {
        buckets.set(minuteStart, { time: minuteStart, block: 0, alert: 0 });
      }

      const bucket = buckets.get(minuteStart)!;
      if (alert.decision === 'BLOCK') {
        bucket.block += (alert.count || 1);
      } else if (alert.decision === 'ALERT') {
        bucket.alert += (alert.count || 1);
      }
    });
    
    // Fill in empty minutes for a continuous timeline
    let currentTime = startOfMinute(thirtyMinutesAgo);
    const endTime = endOfMinute(now);

    while(currentTime <= endTime) {
      const minuteKey = currentTime.toISOString();
      if (!buckets.has(minuteKey)) {
        buckets.set(minuteKey, { time: minuteKey, block: 0, alert: 0 });
      }
      currentTime = new Date(currentTime.getTime() + 60 * 1000);
    }
    
    return Array.from(buckets.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  }, [allAlerts]);

  return (
    <div className="h-[250px]">
      {chartData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBlock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAlert" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: 'hsl(var(--secondary))' }}
            wrapperStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
          />
          <Area type="monotone" dataKey="block" stroke="hsl(var(--chart-4))" fillOpacity={1} fill="url(#colorBlock)" />
          <Area type="monotone" dataKey="alert" stroke="hsl(var(--chart-3))" fillOpacity={1} fill="url(#colorAlert)" />
        </AreaChart>
      </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Not enough data to display trend.
        </div>
      )}
    </div>
  );
}
