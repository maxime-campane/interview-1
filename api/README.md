# Entretien : import d’utilisateurs

Ouvrez les fichiers dans votre éditeur pour expliquer votre logique en pseudo-code ou avec des commentaires. L’API Nest peut aussi démarrer, avec des données fictives en mémoire et un endpoint GraphQL pour le front.

## Démarrer

Suivre l’installation dans le [README de l’entretien](../README.md), puis lancer `pnpm dev` depuis `interview-1/`. Pour démarrer uniquement l’API, utiliser `pnpm dev:api`.

GraphQL est disponible sur `http://127.0.0.1:3101/graphql`. `src/management.resolver.ts` regroupe les opérations pour lister, créer, modifier et supprimer les utilisateurs et les sites. Les modifications sont réinitialisées au redémarrage de l’API. Aucune base de données n’est nécessaire ; le modèle Prisma reste un support de lecture.

Le traitement d’import reste à écrire : le webhook répond 501. Les fichiers JSON de `examples/` servent d’entrées fictives. Aucun appel à un fournisseur réel n’est effectué.

## Stockage des utilisateurs

`UserStoreService` est injecté dans le resolver GraphQL et le service webhook. Ils utilisent la même instance dans l’API. Le service propose `getAll()`, `create(fields)`, `update(id, fields)` et `delete(id)`. `getAll()` inclut les comptes supprimés ; `delete()` renseigne `deletedAt`.

Ce stockage reprend le CRUD existant et la contrainte d’email unique. Les règles de nettoyage, de rapprochement et d’import restent à expliquer ou à implémenter. Une écriture via ce service apparaît dans le front après rechargement de la page.

## Simuler un envoi d’email

`FakeEmailService` est injecté dans `UserStoreService` et le service webhook. Sa méthode `sendEmail({ to, subject, body })` affiche l’email dans les logs et renvoie une promesse résolue. Elle n’envoie aucun email réel.

```ts
await this.emailService.sendEmail({
  to: user.email,
  subject: 'Bienvenue',
  body: `Bonjour ${user.firstName}, votre compte a été créé.`,
});
```

`UserStoreService.create()` attend déjà l’envoi d’un email de bienvenue après la création. Cette méthode est asynchrone et renvoie `Promise<User>`.

## Simuler un upload de photo

Le formulaire User envoie le fichier à `POST /upload/profile-picture` en `multipart/form-data`, dans le champ `file`. `FakeUploadService` enregistre la photo dans `api/upload/`, avec son nom de fichier, et renvoie `{ pictureUrl }`. Cette chaîne est enregistrée sur le User via GraphQL ; sans photo, elle vaut `""`.

`GET /upload/:filename` sert la photo. Les formats acceptés sont JPEG, PNG, WebP et GIF, jusqu’à 5 Mo. Les fichiers restent sur disque au redémarrage de l’API ; les utilisateurs restent stockés en mémoire.

## Envoyer des événements au webhook

Avec l’API démarrée, lancer depuis `interview-1/` :

```sh
pnpm send-webhook:all       # Tous les scénarios, dans l’ordre
pnpm send-webhook:list      # Voir les commandes disponibles
pnpm send-webhook:create    # Création
pnpm send-webhook:update    # Modification
pnpm send-webhook:delete    # Suppression
```

La commande envoie les événements un par un et affiche chaque réponse HTTP. Elle continue après un refus pour montrer les cas suivants. Une erreur réseau arrête l’envoi ; une réponse 5xx donne un code de sortie 1. Un refus 4xx peut être attendu selon le scénario. Vérifier aussi les données et les logs pour juger le traitement.

Chaque scénario inclut les événements nécessaires à sa mise en place. Les identifiants sont fixes pour permettre les rejeux. Redémarrer l’API avant un nouvel essai indépendant. Les cas et leur ordre sont dans `examples/webhook-scenarios.json`.

## Contexte et exercice

Notre API possède des utilisateurs. Nous voulons intégrer un premier fournisseur externe qui envoie des événements par webhook.

1. Expliquez le fonctionnement d’un webhook, ses avantages et ses limites.
2. Dans le controller et le service webhook, montrez comment traiter une création, une modification et une suppression.

Vous pouvez poser des questions sur les règles métier et proposer des changements au modèle. La documentation et l’IA sont autorisées ; expliquez les choix que vous retenez. L’intervieweur vous donnera quelques scénarios à examiner.

## Fichiers à ouvrir

- `prisma/schema.prisma` : modèle `User`, avec un email unique en base.
- `src/users/user-store.service.ts` : stockage partagé et opérations de lecture et d’écriture.
- `src/emails/fake-email.service.ts` : simulation d’un envoi d’email.
- `src/fixtures/local-users.ts` : les 4 utilisateurs de référence pour l’import, dont un supprimé. `users.ts` ajoute les autres utilisateurs affichés dans le front.
- `src/integrations/dto/` : types des données reçues.
- `src/integrations/user-webhook.controller.ts` et `user-webhook.service.ts` : réception et traitement d’un événement.
- `examples/` : événements webhook et liste des scénarios au format JSON.

```text
GraphQL → ManagementResolver → UserStoreService
Webhook → UserWebhookController → UserWebhookService → UserStoreService
```

## Contrat du fournisseur fictif

Le fournisseur utilise ses propres identifiants, différents des identifiants locaux. Il transmet les dates sous forme de chaînes et certains téléphones au format national. Pour cet exercice, le pays de ces numéros est la France.

Les événements webhook ont un `eventId`, une date `occurredAt` et un type : création, modification ou suppression. Leur arrivée dans l’ordre et une livraison unique ne sont pas garanties. Dans une modification, un champ absent n’a pas été transmis ; `null` est une valeur explicitement vide pour un champ facultatif.

Le téléphone n’est pas unique dans notre modèle. Une suppression locale utilise `deletedAt`. Les règles de rapprochement, de fusion et de priorité entre les données locales et externes restent à discuter.

Toutes les données sont fictives.
