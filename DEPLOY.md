# Mettre l'app en ligne

L'app a 3 morceaux a heberger :

1. **Base de donnees** -> MongoDB Atlas (cloud, gratuit)
2. **Backend** (Express) -> Render (gratuit)
3. **Front** (app web Expo) -> Vercel

> Pourquoi le 404 sur Vercel au depart ? Parce que Vercel pointait sur la racine
> du depot (un monorepo backend + mobile) sans rien a servir. Il faut lui dire de
> construire l'app web depuis le dossier `mobile/`, ET heberger le backend a part.

Fais les etapes dans l'ordre.

---

## 1. MongoDB Atlas (base de donnees)

1. Cree un compte sur https://www.mongodb.com/atlas et un cluster gratuit (M0).
2. Dans **Database Access** : cree un utilisateur (login + mot de passe).
3. Dans **Network Access** : ajoute `0.0.0.0/0` (autorise tout, pour que Render se connecte).
4. **Connect > Drivers** : copie l'URI, du type
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/finance_app`
   (ajoute `/finance_app` avant le `?` pour nommer la base).

Garde cet URI pour l'etape suivante.

---

## 2. Backend sur Render

1. Pousse ce depot sur GitHub (si ce n'est pas deja fait).
2. Sur https://render.com : **New > Blueprint**, choisis ton depot.
   Render lit le fichier `render.yaml` a la racine et cree le service `finance-backend`.
3. Dans les **Environment Variables** du service, remplis :
   - `MONGODB_URI` = l'URI Atlas de l'etape 1
   - `GNEWS_API_TOKEN` = ta cle gratuite depuis https://gnews.io (pour les news ; optionnel)
   - `JWT_SECRET` est genere automatiquement.
4. Deploie. A la fin, Render te donne une URL du type
   `https://finance-backend.onrender.com`.
5. Verifie : ouvrir cette URL doit afficher `{"name":"Finance API","status":"ok"}`.

> Note : le plan gratuit Render "s'endort" apres inactivite ; la 1re requete peut
> prendre ~30 s a reveiller le serveur.

---

## 3. Front sur Vercel

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
| Render (backend) | `MONGODB_URI` | URI MongoDB Atlas |
| Render (backend) | `JWT_SECRET` | genere par Render |
| Render (backend) | `GNEWS_API_TOKEN` | cle gnews.io (optionnel) |
| Vercel (front) | `EXPO_PUBLIC_API_URL` | URL Render + `/api` |

Une fois les 3 etapes faites, ouvre l'URL Vercel, cree ton compte, et l'app
fonctionne en ligne avec tes donnees stockees sur Atlas.
