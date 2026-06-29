-- =============================================================================
-- MyFinance — Migration 0002 : réaligne le schéma sur le code applicatif
--
-- Le schéma 0001 a été dépassé par des fonctionnalités ajoutées ensuite
-- (pistes/missions de challenge, période, budget par catégorie, validation de
-- budget mensuel, suivi des opportunités payées, catégorie sur les revenus).
-- La base de production avait été patchée à la main ; ce fichier rend ces
-- changements REPRODUCTIBLES pour tout nouveau déploiement Supabase.
--
-- 100 % idempotent (IF NOT EXISTS / garde-fous) : exécutable sans risque même
-- sur une base déjà à jour.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CATEGORIES : budget mensuel prévu par catégorie de dépense.
-- -----------------------------------------------------------------------------
alter table public.categories
  add column if not exists planned numeric(14, 2) not null default 0;

-- -----------------------------------------------------------------------------
-- INCOMES : catégorie de revenu (salaire, freelance...) — classement des entrées.
-- -----------------------------------------------------------------------------
alter table public.incomes
  add column if not exists category_id uuid references public.categories (id) on delete set null;

-- -----------------------------------------------------------------------------
-- TRANSACTIONS : tag du mois budgétaire validé (clé 'YYYY-MM') pour retrouver
-- l'état "payé" d'un budget de catégorie.
-- -----------------------------------------------------------------------------
alter table public.transactions
  add column if not exists budget_month text;

-- -----------------------------------------------------------------------------
-- CHALLENGES : période choisie (1w/2w/1m/.../1y) en plus de la deadline.
-- -----------------------------------------------------------------------------
alter table public.challenges
  add column if not exists period text;

-- challenge_missions : pistes d'un challenge (montant estimé puis réel validé).
-- Table enfant jointe par Challenge.find (store.js _selectStr).
create table if not exists public.challenge_missions (
  id               uuid primary key default gen_random_uuid(),
  challenge_id     uuid not null references public.challenges (id) on delete cascade,
  title            text not null default '',
  estimated_amount numeric(14, 2) not null default 0,
  actual_amount    numeric(14, 2),
  done             boolean not null default false,
  date             timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index if not exists challenge_missions_challenge_idx
  on public.challenge_missions (challenge_id);
alter table public.challenge_missions enable row level security;

-- -----------------------------------------------------------------------------
-- OPPORTUNITIES : suivi des placements suivis/clôturés + statut "payé".
-- -----------------------------------------------------------------------------
alter table public.opportunities
  add column if not exists date    timestamptz not null default now();
alter table public.opportunities
  add column if not exists paid_at timestamptz;

-- Élargit la contrainte de statut pour inclure 'paid' (placement encaissé).
alter table public.opportunities
  drop constraint if exists opportunities_status_check;
alter table public.opportunities
  add constraint opportunities_status_check
  check (status in ('open', 'won', 'lost', 'paid'));
