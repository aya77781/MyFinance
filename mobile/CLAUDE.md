# CLAUDE.md — Finance App · Guide de travail autonome

> Ce fichier est le **point d'entrée unique** pour toute session de travail sur l'app.
> Claude doit le lire en entier avant de commencer, puis **itérer sans demander de validation** à chaque étape.

---

## 🎯 Vision produit

Application mobile de **gestion de budget personnel**, design épuré façon **Revolut**.  
- Mono-utilisateur · Devise EUR · Interface 100 % française  
- Objectif UX : simple, rapide, gratifiant (feedback visuel, micro-animations)  
- Objectif métier : donner une image claire de la santé financière en moins de 10 secondes d'usage

---

## 🏗️ Stack technique

| Couche | Techno |
|--------|--------|
| Mobile | Expo / React Native (iOS + Android + Web) |
| Backend | Node.js + Express (API REST) |
| Données | Fichiers JSON dans `backend/data/` · Supabase disponible en dépendance |
| Auth | JWT + bcrypt (inscription / connexion) |
| Déploiement | Front → Vercel · Backend → Render (ou tout Vercel en démo) |

---

## 📁 Architecture du projet

```
App/
├── backend/
│   └── src/
│       ├── routes/        # auth, dashboard, transactions, income,
│       │                  # charges, categories, savings, challenges, market
│       ├── models/        # User, Transaction, Income, FixedCharge,
│       │                  # Category, Saving, Challenge, Opportunity
│       └── store.js       # Lecture / écriture fichiers JSON
└── mobile/
    └── src/
        ├── screens/       # Dashboard, Transactions, Budget, Savings,
        │                  # Challenges, Market, Opportunities, Auth
        ├── components/    # DonutChart, TimelineChart, GaugeRing, etc.
        └── navigation/    # Tabs (bottom nav)
```

---

## 📱 Fonctionnalités — 6 écrans principaux

### 1. Accueil (Dashboard)
- Solde du mois, taux d'épargne
- Donut chart des dépenses par catégorie
- Tendance 6 mois (TimelineChart)
- Liste des dernières transactions

### 2. Transactions
- Ajout dépense / revenu
- Groupement par jour
- Appui long → suppression
- Filtres par catégorie / période

### 3. Budget
- Revenus stables + charges fixes + catégories → **reste à vivre prévisionnel**
- Vue "enveloppes" par catégorie

### 4. Épargne
- Pochettes d'objectifs avec barre de progression
- Actions : ajouter / retirer des fonds

### 5. Challenges
- Défis financiers : no-spend days, défi 52 semaines, etc.
- Suivi de progression gamifié

### 6. Marché
- Actus finance en temps réel (API GNews)
- Opportunités d'épargne / investissement par région : France, Maroc, Europe, USA, Monde

---

## ⚠️ Règles métier critiques

1. **Mono-utilisateur** — pas de multi-compte, pas de partage
2. **Devise EUR uniquement** — pas de conversion, pas de multi-devises
3. **Interface 100 % française** — labels, messages d'erreur, dates, nombres
4. **Premier lancement** : écran "Créer mon compte" + 8 catégories créées automatiquement :
   - Alimentation, Transport, Logement, Loisirs, Santé, Vêtements, Abonnements, Divers
5. **L'app mobile ne lit jamais les fichiers JSON directement** — toujours via l'API HTTP
6. **Vercel + /tmp** : données éphémères (OK démo, pas production)

---

## 🔌 APIs externes

| Service | Usage | Variable d'env |
|---------|-------|----------------|
| GNews | Actualités financières temps réel | `GNEWS_API_KEY` |
| Supabase | Option DB persistante (non activée par défaut) | `SUPABASE_URL` / `SUPABASE_ANON_KEY` |

---

## 🚀 Repos GitHub de référence / inspiration

Consulter ces dépôts pour s'inspirer des patterns, composants et bonnes pratiques :

```
# Apps de finance personnelle en React Native / Expo
https://github.com/betomoedano/React-Native-Expense-Tracker-App
https://github.com/snackbag/financial-app
https://github.com/wcandillon/can-it-be-done-in-react-native

# Design system / composants Revolut-like
https://github.com/rainbow-me/rainbow          # wallet app, très bon design
https://github.com/margelo/react-native-graph  # graphiques financiers natifs

# Charts / visualisation
https://github.com/FormidableLabs/victory-native
https://github.com/margelo/react-native-graph

# Patterns Expo / navigation
https://github.com/expo/examples
https://github.com/software-mansion/react-native-screens
```

---

## 🔄 Protocole de session autonome (1h non-stop)

### Comportement attendu de Claude

```
BOUCLE PRINCIPALE (répéter jusqu'à fin de session) :
  1. Lire l'état actuel du code (screens, components, routes concernés)
  2. Identifier l'amélioration la plus impactante disponible
  3. Implémenter le changement complet (pas de demi-mesures)
  4. Mettre à jour ce CLAUDE.md si l'architecture évolue
  5. Logger l'action dans le JOURNAL ci-dessous
  6. Retour à l'étape 1
```

### Règles de comportement
- ✅ **Agir sans demander de validation** sur chaque micro-décision
- ✅ **Toujours finir** ce qu'on a commencé avant de passer à autre chose
- ✅ **Préférer les petites améliorations cumulatives** aux refactos massives
- ✅ **Tester mentalement** chaque changement (pas de régression évidente)
- ❌ Ne pas demander "est-ce que je peux ?" ou "tu veux que je ?"
- ❌ Ne pas laisser un fichier dans un état cassé
- ❌ Ne pas changer la stack sans raison impérative

### Priorités d'amélioration (ordre décroissant)

```
P0 — Bugs bloquants (crash, données perdues, auth cassée)
P1 — UX critique (navigation cassée, écran vide, loader infini)
P2 — Fonctionnalités manquantes ou incomplètes
P3 — Performance (re-renders inutiles, appels API redondants)
P4 — Design & polish (animations, micro-interactions, cohérence visuelle)
P5 — Code quality (refacto, types TS, commentaires)
```

---

## 📊 Contexte actuel de l'app (à mettre à jour après chaque session)

### État général
- [ ] Auth (login / register) : **fonctionnel**
- [ ] Dashboard : **fonctionnel** — graphiques présents
- [ ] Transactions : **fonctionnel** — ajout/suppression OK
- [ ] Budget : **partiel** — à compléter
- [ ] Épargne : **partiel** — à compléter
- [ ] Challenges : **en cours**
- [ ] Marché : **en cours** — GNews intégré

### Dettes techniques connues
- ~~Pas de gestion d'erreur réseau sur tous les écrans~~ → **traité** : toasts globaux (`components/Toast.js`) + FormSheet affiche les erreurs de soumission. Reste à étendre aux mutations Challenges/Budget (charges/income) qui passent par Alert.
- Pas de loading skeleton (juste un spinner basique)
- Pas de pull-to-refresh sur toutes les listes
- Pas de feedback haptic sur les actions importantes
- Données /tmp éphémères → pas de persistance réelle en prod
- Pas de tests unitaires

### Dernières modifications (journal)
<!-- Remplir après chaque session -->
| Date | Fichier(s) | Changement |
|------|-----------|------------|
| —    | —         | Initialisation du CLAUDE.md |
| 2026-06-29 | components/Toast.js (nouveau), App.js | **P1** Systeme de toasts global (erreur/succes/info), monte sous SafeAreaProvider. Remplace les `console.warn` silencieux : l'utilisateur voit enfin les erreurs reseau. 100% JS, aucune dep native. |
| 2026-06-29 | components/FormSheet.js | **P1** Les erreurs de soumission (validation `throw` ou reseau) sont affichees via toast et la feuille reste ouverte pour correction (avant : console.warn silencieux). Couvre tous les ecrans utilisant FormSheet. |
| 2026-06-29 | screens/Savings, Transactions, Challenges, Budget, Opportunities | **P1** `load()` : `console.warn` -> `toast.error`. Mutations via FormSheet relèvent l'exception (gestion centralisee). Validations montant/nom converties en `throw` traduit. |
| 2026-06-29 | components/GoalCard.js | **P1** i18n : "Ajouter"/"% atteint" codes en dur en francais -> cles traduites (goalCard.add / goalCard.reached). Corrige l'UX bilingue. |
| 2026-06-29 | backend/routes/income.js, charges.js | **P1 data** `active: true` par defaut a l'insertion (sinon revenus/charges exclus des totaux si la colonne n'a pas de defaut). |
| 2026-06-29 | screens/BudgetScreen.js | **P1 data** Totaux : `active !== false` (les enregistrements legacy sans le champ sont comptes actifs). |
| 2026-06-29 | screens/OpportunitiesScreen.js | **P1** Validation titre (`throw` traduit), gestion d'erreur sur suppression (toast). Faux positif audit (resultMag) verifie : la magnitude est stockee et le signe reconstruit depuis le statut — pas de perte de donnee. |
| 2026-06-29 | backend/app.js | **P5** Handler 404 JSON pour les routes inconnues (au lieu du HTML Express). Teste OK (GET/404/401). |
| 2026-06-29 | screens/Transactions, Savings | **P4** Feedback de succes gratifiant (toast.success) apres ajout/modif de transaction et creation/contribution d'epargne. Aligne avec la vision "feedback visuel". |

| 2026-06-29 | screens/Challenges, Budget | **P1** Gestion d'erreur (toast) sur toutes les mutations hors-FormSheet (suppressions, reopen/delete mission, annulation de validation). Validations nom/montant converties en `throw` traduit. |

**Verifie cette session (sante P0)** : backend boote, Supabase connecte et sain (login bidon -> 401 propre = table users interrogeable), 404/401 OK. Tous les fichiers JSX touches passent `@babel/parser`.

---

## 🧠 Décisions d'architecture déjà prises (ne pas remettre en cause sans raison)

1. **JSON files** comme store → simple, zéro config, suffisant pour mono-user
2. **Expo** (pas bare React Native) → déploiement web inclus, plus simple
3. **Bottom tab navigation** → standard mobile, pas de drawer
4. **API REST** (pas GraphQL) → plus simple à maintenir
5. **Pas de Redux** → Context API ou état local suffisant pour mono-user
6. **GNews** pour le marché → gratuit, API simple

---

## 🎨 Design system

### Couleurs principales
```
Background   : #0A0A0A (noir profond)
Card         : #141414 / #1C1C1E
Accent bleu  : #4F8EF7  (actions primaires)
Accent vert  : #30D158  (revenus, positif)
Accent rouge : #FF453A  (dépenses, négatif)
Texte        : #FFFFFF / #EBEBF5 / #8E8E93 (primaire / secondaire / tertiaire)
```

### Typographie
- Titres : SF Pro Display Bold / System font Bold
- Corps : SF Pro Text Regular / System font Regular
- Chiffres financiers : font-variant-numeric: tabular-nums (alignement)

### Composants UI récurrents
- `GaugeRing` — anneau de progression (épargne, budget)
- `DonutChart` — répartition par catégorie
- `TimelineChart` — tendance 6 mois
- `TransactionRow` — ligne de transaction avec icône catégorie
- `AmountBadge` — montant coloré +/- avec devise

---

## 🔧 Commandes utiles

```bash
# Lancer le backend
cd backend && npm run dev

# Lancer l'app mobile / web
cd mobile && npx expo start

# Lancer les deux en parallèle
npm run dev  # (depuis la racine si script configuré)

# Vérifier les dépendances
cd mobile && npx expo doctor
```

---

## 📝 Notes de fin de session

> Remplir ici après chaque session de travail intensive :
> - Ce qui a été fait
> - Ce qui reste à faire (P0/P1 en priorité)
> - Tout bug découvert mais non résolu

---

### Session du 2026-06-29 (autonome ~1h)

**Fait** — Thème : gestion d'erreur réseau + feedback utilisateur (P1) sur toute l'app, et robustesse données (P1).
- Système de toasts global réutilisable (`components/Toast.js`) ; FormSheet affiche désormais erreurs de validation/réseau et garde la feuille ouverte.
- Toutes les mutations (FormSheet + Alert) de Transactions, Savings, Challenges, Budget, Opportunities remontent les erreurs à l'utilisateur (fin des `console.warn` silencieux).
- Feedback de succès (toast.success) sur les actions clés → app plus gratifiante.
- i18n : libellés FR codés en dur dans GoalCard → traduits (UX bilingue réparée).
- Données : `active: true` par défaut côté backend (income/charges) + lecture tolérante (`active !== false`) → plus de revenus/charges fantômes exclus des totaux.
- Backend : handler 404 JSON.

**Reste à faire (prochaine session)**
- P4 : loading skeletons (actuellement spinner basique) — composant `Skeleton` réutilisable à créer.
- P4 : feedback haptique (nécessite `expo-haptics`, non installé — voir blocage ci-dessous).
- P3 : Budget charge 500 transactions à chaque focus → envisager un filtre par plage de mois côté serveur.
- P2 : MarketScreen — régions en dur si l'API échoue (fallback silencieux).

**Blocages techniques notés**
- `expo-haptics` non installé → feedback haptique reporté (éviter d'ajouter une dep native en session courte sans rebuild).
- Le `.env` backend pointe un projet Supabase (`nwnjturkfvknbtawtjvo`) non accessible via le MCP Supabase de la session → introspection schéma impossible ; santé vérifiée via l'API à la place.

*Dernière mise à jour : 2026-06-29 (session autonome)*