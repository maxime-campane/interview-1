import { useState, type ChangeEvent } from 'react';
import { UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, UserFormValues } from '@/types/user';

interface UserDialogProps {
  user: User | null;
  error: string;
  onClose: () => void;
  onSave: (values: UserFormValues) => Promise<void>;
}

export function UserDialog({ user, error, onClose, onSave }: UserDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<UserFormValues>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      pictureUrl: user?.pictureUrl ?? '',
      phone: user?.phone ?? '',
      birthdate: user?.birthdate?.slice(0, 10) ?? '',
    },
  });

  const pictureUrl = watch('pictureUrl');
  const disabled = isSubmitting || uploading;

  async function uploadPicture(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      const result: { pictureUrl?: string; message?: string } = await response.json();

      if (!response.ok || !result.pictureUrl) {
        throw new Error(result.message ?? 'Impossible d’ajouter la photo.');
      }

      setValue('pictureUrl', result.pictureUrl, { shouldDirty: true });
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : 'Impossible de joindre l’API.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !disabled) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pb-5 pt-6 text-left">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-accent text-primary"><UserRound className="size-5" /></div>
          <DialogTitle className="text-xl">{user ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</DialogTitle>
          <DialogDescription>{user ? 'Mettez à jour les informations de cet utilisateur.' : 'Renseignez les informations du nouvel utilisateur.'}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit(onSave)}>
          <div className="grid gap-5 px-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-primary">
                {pictureUrl ? <img src={pictureUrl} alt="Photo de profil" className="size-full object-cover" /> : <UserRound aria-hidden="true" className="size-7" />}
              </div>
              <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor="user-picture">Photo de profil</Label>
                <Input id="user-picture" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled} onChange={(event) => void uploadPicture(event)} />
                <input type="hidden" {...register('pictureUrl')} />
                {uploading && <p role="status" className="text-xs text-muted-foreground">Ajout de la photo…</p>}
                {uploadError && <p role="alert" className="text-sm text-destructive">{uploadError}</p>}
                {pictureUrl && <Button type="button" variant="ghost" size="sm" className="h-auto justify-self-start p-0 text-xs text-muted-foreground" disabled={disabled} onClick={() => { setValue('pictureUrl', '', { shouldDirty: true }); setUploadError(''); }}>Retirer la photo</Button>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="user-first-name">Prénom</Label>
                <Input id="user-first-name" autoComplete="given-name" placeholder="Alice" {...register('firstName')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-last-name">Nom</Label>
                <Input id="user-last-name" autoComplete="family-name" placeholder="Martin" {...register('lastName')} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" autoComplete="email" placeholder="alice@example.test" {...register('email')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-phone">Téléphone</Label>
              <Input id="user-phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" {...register('phone')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-birthdate">Date de naissance</Label>
              <Input id="user-birthdate" type="date" autoComplete="bday" {...register('birthdate')} />
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/60 px-6 py-4">
            {error && <p role="alert" className="mr-auto text-sm text-destructive">{error}</p>}
            <Button type="button" disabled={disabled} variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={disabled}>{isSubmitting ? 'Enregistrement…' : user ? 'Enregistrer' : 'Créer l’utilisateur'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
