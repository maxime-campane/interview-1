import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserDialog } from '@/components/users/user-dialog';
import type { User, UserFormValues } from '@/types/user';

const PAGE_SIZE = 8;
const dateFormatter = new Intl.DateTimeFormat('fr-FR');

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ user: User | null } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleUsers = users.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers(): Promise<void> {
      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `query { users { id firstName lastName email pictureUrl phone birthdate createdAt deletedAt } }` }),
          signal: controller.signal,
        });
        const result: { data?: { users: User[] }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de charger les utilisateurs.');
        }
        setUsers(result.data.users);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadUsers();
    return () => controller.abort();
  }, []);

  async function saveUser(values: UserFormValues): Promise<void> {
    const input = { ...values, phone: values.phone || null, birthdate: values.birthdate ? `${values.birthdate}T00:00:00.000Z` : null };
    const editedUser = dialog?.user;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (editedUser) {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation UpdateUser($input: UpdateUserInput!) { updateUser(input: $input) { id firstName lastName email pictureUrl phone birthdate createdAt deletedAt } }`,
            variables: { input: { ...input, id: editedUser.id } },
          }),
        });
        const result: { data?: { updateUser: User }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de modifier l’utilisateur.');
        }
        const savedUser = result.data.updateUser;
        setUsers((current) => current.map((user) => user.id === savedUser.id ? savedUser : user));
        setMessage('Les informations de l’utilisateur ont été mises à jour.');
      } else {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id firstName lastName email pictureUrl phone birthdate createdAt deletedAt } }`,
            variables: { input },
          }),
        });
        const result: { data?: { createUser: User }; errors?: { message: string }[] } = await response.json();
        if (!response.ok || result.errors?.length || !result.data) {
          throw new Error(result.errors?.[0]?.message ?? 'Impossible de créer l’utilisateur.');
        }
        const savedUser = result.data.createUser;
        setUsers((current) => [savedUser, ...current]);
        setPage(1);
        setMessage('L’utilisateur a été créé.');
      }
      setDialog(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: string): Promise<void> {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `mutation DeleteUser($id: ID!) { deleteUser(id: $id) }`, variables: { id } }),
      });
      const result: { data?: { deleteUser: boolean }; errors?: { message: string }[] } = await response.json();
      if (!response.ok || result.errors?.length || !result.data?.deleteUser) {
        throw new Error(result.errors?.[0]?.message ?? 'Impossible de supprimer l’utilisateur.');
      }
      const remainingUsers = users.filter((user) => user.id !== id);
      setUsers(remainingUsers);
      setPage((current) => Math.min(current, Math.max(1, Math.ceil(remainingUsers.length / PAGE_SIZE))));
      setMessage('L’utilisateur a été supprimé.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="users" className="mx-auto w-full max-w-7xl">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">Retrouvez et gérez les utilisateurs de votre espace.</p>
        </div>
        <Button disabled={loading || busy} onClick={() => { setError(''); setDialog({ user: null }); }} className="h-10 gap-2 px-4"><Plus className="size-4" />Créer un utilisateur</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-3 px-6 py-5">
          <h2 className="text-sm font-semibold">Tous les utilisateurs</h2>
          <Badge variant="secondary" className="rounded-md tabular-nums">{users.length}</Badge>
        </div>
        <Table>
          <TableHeader className="bg-muted/65">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-6">Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.map((user, index) => {
              const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sans nom';
              const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || '?';
              return (
                <TableRow key={user.id}>
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${index % 3 === 0 ? 'bg-emerald-50 text-emerald-700' : index % 3 === 1 ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>
                        {user.pictureUrl ? <img src={user.pictureUrl} alt="" className="size-full object-cover" /> : initials}
                      </div>
                      <span className="font-medium">{name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{user.phone || '—'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(user.birthdate)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-1">
                      <Button type="button" disabled={busy} variant="ghost" size="icon" aria-label={`Modifier ${name}`} title="Modifier" onClick={() => { setError(''); setDialog({ user }); }} className="size-8 text-muted-foreground"><Pencil className="size-3.5" /></Button>
                      <Button type="button" disabled={busy} variant="ghost" size="icon" aria-label={`Supprimer ${name}`} title="Supprimer" onClick={() => void deleteUser(user.id)} className="size-8 text-muted-foreground hover:bg-red-50 hover:text-destructive"><Trash2 className="size-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {loading && <TableRow><TableCell colSpan={6} className="py-16 text-center text-muted-foreground">Chargement des utilisateurs…</TableCell></TableRow>}
            {!loading && users.length === 0 && !error && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <UsersRound className="mx-auto mb-3 size-8 text-muted-foreground/60" />
                  <p className="font-medium">Aucun utilisateur</p>
                  <p className="mt-1 text-sm text-muted-foreground">Créez un utilisateur pour commencer.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">{users.length === 0 ? '0 utilisateur' : `${start + 1}–${Math.min(start + PAGE_SIZE, users.length)} sur ${users.length} utilisateurs`}</p>
          <nav aria-label="Pagination des utilisateurs" className="flex items-center gap-2">
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
      {dialog && <UserDialog user={dialog.user} error={error} onClose={() => setDialog(null)} onSave={saveUser} />}
    </section>
  );
}
