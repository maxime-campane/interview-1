import { Building2, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  activePage: 'users' | 'sites';
  onPageChange: (page: 'users' | 'sites') => void;
}

export function AppSidebar({ activePage, onPageChange }: AppSidebarProps) {
  return (
    <aside className="sticky top-0 flex h-svh w-18 shrink-0 flex-col border-r bg-white md:w-60">
      <div className="flex h-20 items-center justify-center gap-3 px-4 md:justify-start md:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white">w</div>
        <span className="hidden text-xl font-semibold tracking-tight md:block">wobee</span>
      </div>
      <div className="px-3 pt-6 md:px-4">
        <p className="mb-3 hidden px-3 text-[11px] font-semibold tracking-[0.13em] text-muted-foreground md:block">ESPACE DE TRAVAIL</p>
        <nav aria-label="Navigation principale" className="grid gap-1">
          <Button
            variant="ghost"
            aria-label="Users"
            title="Users"
            aria-current={activePage === 'users' ? 'page' : undefined}
            onClick={() => onPageChange('users')}
            className={cn('h-11 w-full justify-center gap-3 rounded-lg px-3 font-medium md:justify-start', activePage === 'users' ? 'bg-accent text-accent-foreground hover:bg-accent' : 'text-muted-foreground')}
          >
            <UsersRound className="size-4.5" />
            <span className="hidden md:inline">Users</span>
          </Button>
          <Button
            variant="ghost"
            aria-label="Sites"
            title="Sites"
            aria-current={activePage === 'sites' ? 'page' : undefined}
            onClick={() => onPageChange('sites')}
            className={cn('h-11 w-full justify-center gap-3 rounded-lg px-3 font-medium md:justify-start', activePage === 'sites' ? 'bg-accent text-accent-foreground hover:bg-accent' : 'text-muted-foreground')}
          >
            <Building2 className="size-4.5" />
            <span className="hidden md:inline">Sites</span>
          </Button>
        </nav>
      </div>
      <div className="mt-auto p-3 md:p-4">
        <Separator className="mb-4" />
        <div className="flex items-center justify-center gap-3 rounded-lg px-1 py-2 md:justify-start md:px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground"><Building2 className="size-4" /></div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Équipe Wobee</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Espace d’administration</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
