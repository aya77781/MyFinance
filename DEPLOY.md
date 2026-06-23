# Mettre l'app en ligne (tout sur Vercel)

Front (app web Expo) **et** backend (API Express) sont heberges sur **un seul
projet Vercel** :

- L'app web est servie en statique (export Expo).
- L'API tourne en **fonction serverless** (`api/index.js`, qui reutilise
  `backend/src/app.js`). Toutes les requetes `/api/*` y sont redirigees.

> ⚠️ **Persistance des donnees** : Vercel est serverless, son disque est en
> lecture seule sauf `/tmp`, qui est **ephemere**. Le stockage en fichiers JSON
> ecrit donc dans `/tmp` et les donnees (comptes inclus) sont **perdues** a
> chaque "cold start" / redeploiement. C'est adapte a une **demo**, pas a un
> usage durable. Pour des donnees qui persistent, heberge le backend sur une
> plateforme avec disque (Render + disque persistant), ou remplace le stockage
> fichiers par un magasin gere (Vercel KV/Postgres).

---

## 1. Importer le projet sur Vercel

1. Pousse ce depot sur GitHub (si ce n'est pas deja fait).
2. Sur https://vercel.com : **Add New > Project**, choisis le depot `MyFinance`.
3. **IMPORTANT — Root Directory** : laisse la **racine du depot** (`./`).
   **NE mets PAS `mobile`** : Vercel doit utiliser le `vercel.json` racine (qui
   build le front *et* expose le dossier `api/`). Si un ancien projet pointait
   sur `mobile`, change-le dans **Settings > General > Root Directory**.
4. Laisse les autres reglages par defaut (le `vercel.json` racine s'occupe de
   l'install, du build et des redirections).
5. Deploie. Tu obtiens une URL `https://...vercel.app` : c'est ton app.

L'URL de l'API est **relative** (`/api`), injectee au build via
`EXPO_PUBLIC_API_URL=/api` (voir `vercel.json`). Front et back partageant le
meme domaine, il n'y a aucune URL externe a configurer.

---

## 2. Variables d'environnement (optionnel)

Aucune variable n'est obligatoire pour que la connexion/inscription marche.
Pour aller plus loin, dans **Settings > Environment Variables** :

| Variable | Role | Defaut |
|----------|------|--------|
| `JWT_SECRET` | Cle de signature des tokens | une valeur de dev par defaut (mets-en une vraie en prod) |
| `GNEWS_API_TOKEN` | Actus finance (onglet Marche) | vide = pas de news |

> Apres avoir change une variable, **redeploie** (les variables `EXPO_PUBLIC_*`
> sont integrees au build du front).

---

## Verifier que ca marche

- Ouvre `https://ton-app.vercel.app/api` -> doit afficher
  `{"name":"Finance API","status":"ok"}` (preuve que l'API serverless repond).
- Sur l'app, cree un compte : l'inscription doit reussir (plus de 404).
- Garde en tete que les donnees peuvent disparaitre apres un moment d'inactivite
  (limite `/tmp` decrite plus haut).
