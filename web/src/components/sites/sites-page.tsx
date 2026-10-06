import { useEffect, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SiteDialog } from '@/components/sites/site-dialog';
import type { Site, SiteFormValues } from '@/types/site';

const PAGE_SIZE = 8;
const dateFormatter = new Intl.DateTimeFormat('fr-FR');

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ site: Site | null } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pageCount = Math.max(1, Math.ceil(sites.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleSites = sites.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSites(): Promise<void> {
      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `query { sites { id name address postalCode city createdAt } }` }),
          signal: controller.signal,
        });
        const result: { data?: { sites: Site[] }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de charger les sites.');
        }
        setSites(result.data.sites);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadSites();
    return () => controller.abort();
  }, []);

  async function saveSite(values: SiteFormValues): Promise<void> {
    const editedSite = dialog?.site;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (editedSite) {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation UpdateSite($input: UpdateSiteInput!) { updateSite(input: $input) { id name address postalCode city createdAt } }`,
            variables: { input: { ...values, id: editedSite.id } },
          }),
        });
        const result: { data?: { updateSite: Site }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de modifier le site.');
        }
        const savedSite = result.data.updateSite;
        setSites((current) => current.map((site) => site.id === savedSite.id ? savedSite : site));
        setMessage('Les informations du site ont été mises à jour.');
      } else {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation CreateSite($input: CreateSiteInput!) { createSite(input: $input) { id name address postalCode city createdAt } }`,
            variables: { input: values },
          }),
        });
        const result: { data?: { createSite: Site }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de créer le site.');
        }
        const savedSite = result.data.createSite;
        setSites((current) => [savedSite, ...current]);
        setPage(1);
        setMessage('Le site a été créé.');
      }
      setDialog(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteSite(id: string): Promise<void> {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `mutation DeleteSite($id: ID!) { deleteSite(id: $id) }`, variables: { id } }),
      });
      const result: { data?: { deleteSite: boolean }; errors?: { message: string }[] } = await response.json();
      if (!response.ok || result.errors?.length || !result.data?.deleteSite) {
        throw new Error(result.errors?.[0]?.message ?? 'Impossible de supprimer le site.');
      }
      const remainingSites = sites.filter((site) => site.id !== id);
      setSites(remainingSites);
      setPage((current) => Math.min(current, Math.max(1, Math.ceil(remainingSites.length / PAGE_SIZE))));
      setMessage('Le site a été supprimé.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="sites" className="mx-auto w-full max-w-7xl">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sites</h1>
          <p className="mt-2 text-sm text-muted-foreground">Retrouvez et gérez les sites de votre organisation.</p>
        </div>
        <Button disabled={loading || busy} onClick={() => { setError(''); setDialog({ site: null }); }} className="h-10 gap-2 px-4"><Plus className="size-4" />Créer un site</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-3 px-6 py-5">
          <h2 className="text-sm font-semibold">Tous les sites</h2>
          <Badge variant="secondary" className="rounded-md tabular-nums">{sites.length}</Badge>
        </div>
        <Table>
          <TableHeader className="bg-muted/65">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-6">Site</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Code postal</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleSites.map((site) => {
              const name = site.name || 'Sans nom';
              return (
                <TableRow key={site.id}>
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Building2 className="size-4" /></div>
                      <span className="font-medium">{name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 truncate text-muted-foreground" title={site.address}>{site.address || '—'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{site.postalCode || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{site.city || '—'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{dateFormatter.format(new Date(site.createdAt))}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-1">
                      <Button type="button" disabled={busy} variant="ghost" size="icon" aria-label={`Modifier ${name}`} title="Modifier" onClick={() => { setError(''); setDialog({ site }); }} className="size-8 text-muted-foreground"><Pencil className="size-3.5" /></Button>
                      <Button type="button" disabled={busy} variant="ghost" size="icon" aria-label={`Supprimer ${name}`} title="Supprimer" onClick={() => void deleteSite(site.id)} className="size-8 text-muted-foreground hover:bg-red-50 hover:text-destructive"><Trash2 className="size-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {loading && <TableRow><TableCell colSpan={6} className="py-16 text-center text-muted-foreground">Chargement des sites…</TableCell></TableRow>}
            {!loading && sites.length === 0 && !error && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <Building2 className="mx-auto mb-3 size-8 text-muted-foreground/60" />
                  <p className="font-medium">Aucun site</p>
                  <p className="mt-1 text-sm text-muted-foreground">Créez un site pour commencer.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">{sites.length === 0 ? '0 site' : `${start + 1}–${Math.min(start + PAGE_SIZE, sites.length)} sur ${sites.length} sites`}</p>
          <nav aria-label="Pagination des sites" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="size-4" /></Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Button key={number} variant={number === page ? 'default' : 'ghost'} className="size-8 p-0 text-xs" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => setPage(number)}>{number}</Button>
            ))}
            <Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight className="size-4" /></Button>
          </nav>
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-primary">{message}</p>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      {dialog && <SiteDialog site={dialog.site} error={error} onClose={() => setDialog(null)} onSave={saveSite} />}
    </section>
  );
}
