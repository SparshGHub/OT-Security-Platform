'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Monitoring & Health', href: '/' },
  { name: 'Simulation', href: '/simulate' },
];

function WSStatusIndicator() {
  const { wsStatus } = useAppContext();

  const statusConfig = {
    open: { color: 'bg-green-500', text: 'Connected' },
    connecting: { color: 'bg-yellow-500', text: 'Connecting' },
    closed: { color: 'bg-red-500', text: 'Disconnected' },
  };

  const { color, text } = statusConfig[wsStatus] || statusConfig.closed;

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-3 h-3 rounded-full animate-pulse', color)} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">OT Shield</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <WSStatusIndicator />
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <span>Thermal – Demo</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
