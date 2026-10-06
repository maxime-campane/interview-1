# Gestion des utilisateurs et des sites

Application React et TypeScript avec Vite, Tailwind CSS, composants shadcn/ui et React Hook Form.

Suivre l’installation dans le [README de l’entretien](../README.md), puis lancer `pnpm dev` depuis `interview-1/`. L’application est disponible sur `http://127.0.0.1:5173`.

Pour lancer uniquement le front, utiliser `pnpm dev:web`, avec l’API déjà démarrée. Les requêtes `fetch('/graphql', ...)` passent par le proxy Vite vers l’API Nest sur le port 3101.

La page Users affiche les utilisateurs actifs par pages de 8. On peut créer ou modifier un utilisateur dans une modale et le supprimer directement depuis sa ligne. Aucun formulaire ne comporte de validation, y compris la validation native du navigateur.

Le formulaire permet aussi de choisir une photo de profil et de la prévisualiser. L’API enregistre le fichier dans `api/upload/` ; son URL est enregistrée dans `pictureUrl`. Le proxy Vite transmet également les requêtes `/upload` à l’API.

La page Sites propose les mêmes actions avec 12 sites fictifs au démarrage, également affichés par pages de 8. Le formulaire contient le nom du site, l’adresse, le code postal et la ville.

Les données initiales sont dans `../api/src/fixtures/`. Les changements sont conservés quand on passe d’un onglet à l’autre et après un rechargement. Ils disparaissent au redémarrage de l’API.

Les composants de l’interface se trouvent dans `src/components/users/` et `src/components/sites/`. Les composants shadcn/ui sont dans `src/components/ui/`.

Depuis ce dossier, pour vérifier les types et compiler :

```sh
pnpm build
```

Pour afficher le résultat compilé :

```sh
pnpm preview
```
