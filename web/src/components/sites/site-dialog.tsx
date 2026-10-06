import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Site, SiteFormValues } from '@/types/site';

interface SiteDialogProps {
  site: Site | null;
  error: string;
  onClose: () => void;
  onSave: (values: SiteFormValues) => Promise<void>;
}

export function SiteDialog({ site, error, onClose, onSave }: SiteDialogProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<SiteFormValues>({
    defaultValues: {
      name: site?.name ?? '',
      address: site?.address ?? '',
      postalCode: site?.postalCode ?? '',
      city: site?.city ?? '',
    },
  });

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pb-5 pt-6 text-left">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-accent text-primary"><Building2 className="size-5" /></div>
          <DialogTitle className="text-xl">{site ? 'Modifier un site' : 'Créer un site'}</DialogTitle>
          <DialogDescription>{site ? 'Mettez à jour les informations de ce site.' : 'Renseignez les informations du nouveau site.'}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit(onSave)}>
          <div className="grid gap-5 px-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Nom du site</Label>
              <Input id="site-name" placeholder="Paris République" {...register('name')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-address">Adresse</Label>
              <Input id="site-address" autoComplete="street-address" placeholder="12 rue des Ateliers" {...register('address')} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="site-postal-code">Code postal</Label>
                <Input id="site-postal-code" inputMode="numeric" autoComplete="postal-code" placeholder="75011" {...register('postalCode')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site-city">Ville</Label>
                <Input id="site-city" autoComplete="address-level2" placeholder="Paris" {...register('city')} />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/60 px-6 py-4">
            {error && <p role="alert" className="mr-auto text-sm text-destructive">{error}</p>}
            <Button type="button" disabled={isSubmitting} variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement…' : site ? 'Enregistrer' : 'Créer le site'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
