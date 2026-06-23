# Mettre l'app en ligne

L'app a 2 morceaux a heberger :

1. **Backend** (Express + stockage fichiers JSON) -> Render
2. **Front** (app web Expo) -> Vercel

Il n'y a **aucune base de donnees externe** : le backend stocke tout dans des
fichiers JSON (`backend/data/`).

> Pourquoi le 404 sur Vercel au depart ? Parce que Vercel pointait sur la racine
> du depot (un monorepo backend + mobile) sans rien a servir. Il faut lui dire de
> construire l'app web depuis le dossier `mobile/`, ET heberger le backend a part.

Fais les etapes dans l'ordre.

---

## 1. Backend sur Render

1. Pousse ce depot sur GitHub (si ce n'est pas deja fait).
2. Sur https://render.com : **New > Blueprint**, choisis ton depot.
   Render lit le fichier `render.yaml` a la racine et cree le service `finance-backend`.
3. Dans les **Environment Variables** du service, remplis :
   - `GNEWS_API_TOKEN` = ta cle gratuite depuis https://gnews.io (pour les news ; optionnel)
   - `JWT_SECRET` est genere automatiquement.
4. Deploie. A la fin, Render te donne une URL du type
   `https://finance-backend.onrender.com`.
5. Verifie : ouvrir cette URL doit afficher `{"name":"Finance API","status":"ok"}`.

> Note : le plan gratuit Render "s'endort" apres inactivite ; la 1re requete peut
> prendre ~30 s a reveiller le serveur.

> ⚠️ **Persistance des donnees** : sur Render, le disque par defaut est
> **ephemere** — les fichiers JSON sont effaces a chaque redeploiement ou
> redemarrage. Pour conserver tes donnees en ligne, ajoute un **disque
> persistant** (Render > service > *Disks* > *Add Disk*, ex. montage sur
> `/data`) puis regle la variable `DATA_DIR=/data`. C'est deja prevu dans
> `render.yaml`. Le plan gratuit Render n'inclut pas de disque persistant : il
> faut un plan payant, ou se contenter de donnees non durables pour une demo.

---

## 2. Front sur Vercel

1. Sur https://vercel.com : **Add New > Project**, choisis ton depot.
2. **IMPORTANT - Root Directory** : mets `mobile` (clique "Edit" a cote de Root Directory).
   Vercel utilisera alors `mobile/vercel.json` (build `npx expo export -p web`, sortie `dist`).
3. **Environment Variables** : ajoute
   - `EXPO_PUBLIC_API_URL` = l'URL Render + `/api`, ex :
     `https://finance-backend.onrender.com/api`
4. Deploie. Tu obtiens une URL `https://...vercel.app` : c'est ton app.

> Si tu changes `EXPO_PUBLIC_API_URL` plus tard, il faut **redeployer** le front
> (la variable est integree au build).

---

## Recapitulatif des variables

| Endroit | Variable | Valeur |
|---------|----------|--------|
| Render (backend) | `JWT_SECRET` | genere par Render |
| Render (backend) | `GNEWS_API_TOKEN` | cle gnews.io (optionnel) |
| Render (backend) | `DATA_DIR` | dossier du disque persistant (ex. `/data`) si tu en ajoutes un |
| Vercel (front) | `EXPO_PUBLIC_API_URL` | URL Render + `/api` |

Une fois les 2 etapes faites, ouvre l'URL Vercel, cree ton compte, et l'app
fonctionne en ligne avec tes donnees stockees dans les fichiers JSON du backend.
