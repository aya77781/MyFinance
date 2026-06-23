-- =============================================================================
-- MyFinance — Schéma initial Supabase / PostgreSQL
-- Reproduit fidèlement le modèle de données actuel (stockage JSON backend/data/).
--
-- Collections JSON  ->  Tables SQL
--   users           ->  users
--   categories      ->  categories
--   incomes         ->  incomes
--   fixedcharges    ->  fixed_charges
--   transactions    ->  transactions
--   savings         ->  savings  (+ contributions[]  -> saving_contributions)
--   challenges      ->  challenges (+ entries[]       -> challenge_entries)
--   opportunities   ->  opportunities
--
-- Note : l'authentification actuelle est gérée par le backend (bcrypt + JWT),
-- donc on conserve une table `users` avec password_hash plutôt que de déléguer
-- à Supabase Auth. Migration vers Supabase Auth possible plus tard.
-- =============================================================================

-- Extension pour gen_random_uuid()
create extension if not exists "pgcrypto";

-- Helper : met à jour updated_at automatiquement à chaque UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index users_email_idx on public.users (lower(email));

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  name       text not null,
  type       text not null default 'expense' check (type in ('expense', 'income')),
  color      text not null default '#6E56F7',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_user_idx on public.categories (user_id);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- INCOMES  (revenus stables / récurrents)
-- -----------------------------------------------------------------------------
create table public.incomes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  name         text not null default '',
  amount       numeric(14, 2) not null default 0,
  day_of_month integer not null default 1 check (day_of_month between 1 and 31),
  active       boolean not null default true,
  note         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index incomes_user_idx on public.incomes (user_id);

create trigger incomes_set_updated_at
  before update on public.incomes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- FIXED_CHARGES  (charges fixes / récurrentes)
-- -----------------------------------------------------------------------------
create table public.fixed_charges (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  category_id  uuid references public.categories (id) on delete set null,
  name         text not null default '',
  amount       numeric(14, 2) not null default 0,
  day_of_month integer not null default 1 check (day_of_month between 1 and 31),
  active       boolean not null default true,
  note         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index fixed_charges_user_idx on public.fixed_charges (user_id);

create trigger fixed_charges_set_updated_at
  before update on public.fixed_charges
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- TRANSACTIONS  (mouvements réels : dépense ou revenu ponctuel)
-- -----------------------------------------------------------------------------
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type        text not null default 'expense' check (type in ('expense', 'income')),
  amount      numeric(14, 2) not null default 0,
  date        timestamptz not null default now(),
  note        text not null default '',
  source      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index transactions_user_idx on public.transactions (user_id);
create index transactions_user_date_idx on public.transactions (user_id, date desc);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- SAVINGS  (pochettes / vaults d'épargne)
-- -----------------------------------------------------------------------------
create table public.savings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  name           text not null default '',
  target_amount  numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  color          text not null default '#2BBA88',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index savings_user_idx on public.savings (user_id);

create trigger savings_set_updated_at
  before update on public.savings
  for each row execute function public.set_updated_at();

-- contributions[] (tableau imbriqué) -> table enfant
create table public.saving_contributions (
  id         uuid primary key default gen_random_uuid(),
  saving_id  uuid not null references public.savings (id) on delete cascade,
  amount     numeric(14, 2) not null default 0,
  note       text not null default '',
  date       timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index saving_contributions_saving_idx on public.saving_contributions (saving_id);

-- -----------------------------------------------------------------------------
-- CHALLENGES  (objectifs d'épargne gamifiés)
-- -----------------------------------------------------------------------------
create table public.challenges (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  title          text not null default '',
  description    text not null default '',
  target_amount  numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  deadline       timestamptz,
  status         text not null default 'active' check (status in ('active', 'done', 'abandoned')),
  color          text not null default '#F7A23B',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index challenges_user_idx on public.challenges (user_id);

create trigger challenges_set_updated_at
  before update on public.challenges
  for each row execute function public.set_updated_at();

-- entries[] (tableau imbriqué) -> table enfant
create table public.challenge_entries (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  amount       numeric(14, 2) not null default 0,
  note         text not null default '',
  date         timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index challenge_entries_challenge_idx on public.challenge_entries (challenge_id);

-- -----------------------------------------------------------------------------
-- OPPORTUNITIES  (placements / paris / idées d'investissement suivies)
-- -----------------------------------------------------------------------------
create table public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  title       text not null,
  description text not null default '',
  amount      numeric(14, 2) not null default 0,
  result      numeric(14, 2) not null default 0,
  status      text not null default 'open' check (status in ('open', 'won', 'lost')),
  closed_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index opportunities_user_idx on public.opportunities (user_id);

create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- L'API backend se connecte avec la clé `service_role` (qui contourne la RLS).
-- On active la RLS partout et on NE crée PAS de policy pour anon/authenticated :
-- tout accès client direct (clé anon/publishable) est donc refusé par défaut.
-- =============================================================================
alter table public.users                enable row level security;
alter table public.categories           enable row level security;
alter table public.incomes              enable row level security;
alter table public.fixed_charges        enable row level security;
alter table public.transactions         enable row level security;
alter table public.savings              enable row level security;
alter table public.saving_contributions enable row level security;
alter table public.challenges           enable row level security;
alter table public.challenge_entries    enable row level security;
alter table public.opportunities        enable row level security;
