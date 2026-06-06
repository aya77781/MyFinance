# Finance App

Application mobile de gestion de finances personnelles, style epure facon Revolut.
Suivi des revenus stables, charges fixes, depenses par categorie, epargnes et
challenges financiers, avec visualisation (donut par categorie + tendance 6 mois).

- **Mobile** : Expo / React Native (mono-utilisateur, devise EUR, francais)
- **Backend** : Node + Express + Mongoose
- **Base de donnees** : MongoDB

## Architecture

```
App/
  backend/   API REST + MongoDB
  mobile/    App Expo (React Native)
```

Une app mobile ne se connecte pas directement a MongoDB. L'app parle au backend
(HTTP/JSON), et le backend parle a MongoDB.

## 1. Prerequis

- Node.js 18+ (teste avec Node 22)
- MongoDB :
  - soit **MongoDB local** (installe `MongoDB Community Server`, le service ecoute sur `27017`)
  - soit **MongoDB Atlas** (gratuit) : recupere ton URI de connexion
- L'application mobile **Expo Go** sur ton telephone (App Store / Play Store),
  ou un emulateur Android / iOS.

## 2. Tout lancer avec UNE seule commande

Depuis le dossier `App/` :

```bash
npm run setup    # la 1re fois : installe racine + backend + mobile
npm run web-app  # ouvre l'app dans le navigateur (+ backend)  ← le plus simple
# ou
npm run dev      # backend + Metro pour tester sur telephone (Expo Go) / emulateur
```

Au premier lancement, l'app affiche un ecran **Creer mon compte** : tu choisis
ton email + mot de passe, et tu remplis ensuite tes propres donnees (revenus,
charges, depenses, epargnes, challenges). 8 categories vides sont creees
automatiquement pour pouvoir classer tes depenses tout de suite.

`npm run dev` ouvre les deux processus dans le meme terminal, prefixes `[API]` et `[APP]` :

- `[API]` -> backend sur http://localhost:4000
- `[APP]` -> Metro / Expo : scanne le QR code avec **Expo Go**, ou appuie sur
  `a` (Android) / `i` (iOS) / `w` (web).

Pour tout arreter : `Ctrl + C` une seule fois.

### Scripts disponibles (racine)

| Commande          | Effet                                            |
|-------------------|--------------------------------------------------|
| `npm run setup`   | Installe les dependances (racine + backend + mobile) |
| `npm run web-app` | Lance backend + ouvre l'app dans le navigateur   |
| `npm run dev`     | Lance backend **et** Metro (telephone / emulateur) |
| `npm run reset`   | Vide TOUTES les donnees (comptes inclus) pour repartir de zero |
| `npm run backend` | Lance uniquement l'API                           |
| `npm run mobile`  | Lance uniquement l'app                           |
| `npm run free-ports` | Libere les ports 4000 / 8081 si un ancien process traine |

> `npm run dev` libere automatiquement les ports 4000 et 8081 avant de demarrer
> (evite les erreurs `EADDRINUSE` quand un lancement precedent ne s'est pas
> bien arrete).

> Avant le premier lancement, configure la base si besoin : copie
> `backend/.env.example` en `backend/.env` et adapte `MONGODB_URI`
> (local `mongodb://127.0.0.1:27017/finance_app` ou un URI MongoDB Atlas).

### Connexion app -> backend

L'app detecte automatiquement l'IP de ta machine de dev (via Expo) et appelle
`http://<ton-ip>:4000/api`. Pour que ton **telephone physique** joigne le backend :

- le telephone et l'ordinateur doivent etre sur le **meme reseau wifi** ;
- le pare-feu Windows doit autoriser le port `4000` (Node.js).

Si besoin, force l'adresse en editant `mobile/src/config.js` (`API_PORT` ou le host).

## 4. Fonctionnalites

- **Accueil** : solde du mois, taux d'epargne, donut des depenses par categorie,
  tendance revenus/depenses sur 6 mois, dernieres transactions.
- **Transactions** : ajout depense / revenu (avec provenance), groupees par jour.
  Appui long = supprimer.
- **Budget** : revenus stables + charges fixes recurrentes + categories,
  avec reste a vivre previsionnel.
- **Epargne** : pochettes d'objectifs avec progression, ajout / retrait.
- **Challenges** : defis financiers (no-spend, 52 semaines...) avec suivi de progres.
- **Marche** : actualites finance en temps reel (API GNews) + opportunites d'epargne
  et d'investissement selon la region (France, Maroc, Europe, USA, Monde).

## Mise en ligne

Voir [DEPLOY.md](DEPLOY.md) : front sur Vercel, backend sur Render, base sur
MongoDB Atlas. L'URL de l'API se configure via `EXPO_PUBLIC_API_URL`.

## 5. API (resume)

| Methode | Route                              | Role                               |
|---------|------------------------------------|------------------------------------|
| POST    | `/api/auth/register` / `login`     | Creer un compte / se connecter (JWT) |
| GET     | `/api/dashboard`                   | Agregats du mois + visualisations  |
| CRUD    | `/api/transactions`                | Depenses / revenus ponctuels       |
| CRUD    | `/api/income`                      | Revenus stables                    |
| CRUD    | `/api/charges`                     | Charges fixes                      |
| CRUD    | `/api/categories`                  | Categories                         |
| CRUD    | `/api/savings` (+ `/contributions`)| Epargnes                           |
| CRUD    | `/api/challenges` (+ `/entries`)   | Challenges                         |
```
```
