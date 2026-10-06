# Entretien 1

Ce dossier contient une API Nest avec GraphQL et une application React pour gérer des utilisateurs et des sites.

## Installer et démarrer

Prérequis : **Node.js 24** et **pnpm 11.1.1**. Avec nvm, `nvm use` sélectionne la bonne version de Node. Si pnpm manque, l’installer avec `npm install -g pnpm@11.1.1`.

Cloner le dépôt, puis installer et démarrer depuis `interview-1/` :

```sh
git clone https://github.com/maxime-campane/interview-1.git
cd interview-1
pnpm install --frozen-lockfile
pnpm dev
```

- Application : http://127.0.0.1:5173
- API GraphQL : http://127.0.0.1:3101/graphql

`Ctrl+C` arrête les deux projets. Les ports 5173 et 3101 doivent être disponibles.

Le workspace est défini dans ce dossier. L’API et le front ont chacun leur `pnpm-lock.yaml`, dans `api/` et `web/`. Une installation depuis `interview-1/` installe les deux projets.

Aucune base de données, aucun Docker et aucun fichier `.env` ne sont nécessaires. L’API démarre avec des données fictives en mémoire. Les modifications restent après un rechargement du front et disparaissent au redémarrage de l’API. Le modèle Prisma sert de référence pour l’exercice.

## Commandes utiles

Depuis `interview-1/` :

```sh
pnpm dev:api            # API seule
pnpm dev:web            # Front seul, avec l’API déjà démarrée
pnpm build              # Vérifier les types et compiler les deux projets
pnpm send-webhook:all    # Envoyer tous les scénarios au webhook
pnpm send-webhook:list   # Voir les commandes disponibles
pnpm send-webhook:update # Envoyer le scénario de modification
```

Le webhook reste à compléter. Il répond 501 tant que son traitement n’est pas implémenté. Il partage le même stockage en mémoire que GraphQL ; une écriture apparaît dans le front après rechargement.

Redémarrer l’API pour retrouver les données initiales avant un nouvel essai indépendant.

## Support d’entretien

- [Consignes API](api/README.md)
- [Application React](web/README.md)

Le front utilise React, Tailwind CSS, shadcn/ui et React Hook Form. Les pages Users et Sites proposent un tableau paginé, la création et la modification en modale, et la suppression directe. Les formulaires n’ont pas de validation.

Le formulaire User permet d’ajouter une photo de profil. Le fichier est enregistré dans `api/upload/` et son URL dans `pictureUrl`. Les photos restent sur disque après un redémarrage de l’API.
