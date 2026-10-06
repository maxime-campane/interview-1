import { useEffect, useState } from 'react';
import { Building2, ChevronRight, UsersRound } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { SitesPage } from '@/components/sites/sites-page';
import { UsersPage } from '@/components/users/users-page';

export default function App() {
  const [activePage, setActivePage] = useState<'users' | 'sites'>('users');
  const ActiveIcon = activePage === 'users' ? UsersRound : Building2;
  const pageName = activePage === 'users' ? 'Users' : 'Sites';

  useEffect(() => {
    document.title = `${pageName} · Wobee`;
  }, [pageName]);

  return (
    <div className="flex min-h-svh">
      <AppSidebar activePage={activePage} onPageChange={setActivePage} />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center gap-2.5 border-b bg-white/70 px-5 text-xs text-muted-foreground md:px-8">
          <span>Administration</span><ChevronRight className="size-3" /><span className="font-medium text-foreground">{pageName}</span>
          <div className="ml-auto flex size-8 items-center justify-center rounded-full border bg-white"><ActiveIcon className="size-3.5" /></div>
        </header>
        <main className="px-4 py-7 md:p-8 lg:px-10 lg:py-9">
          <div hidden={activePage !== 'users'}><UsersPage /></div>
          <div hidden={activePage !== 'sites'}><SitesPage /></div>
        </main>
      </div>
    </div>
  );
}
