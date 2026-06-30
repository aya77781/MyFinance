-- =============================================================================
-- MyFinance — Migration 0003 : écran "Life" (roue des activités du mois)
--
-- L'utilisateur liste les activités qu'il veut faire dans le mois (chacune avec
-- un budget). Une roue colorée tire une activité au hasard, 1 fois par jour.
-- L'activité tirée sort de la roue (`drawn = true`) et la date du tirage est
-- conservée (`drawn_at`) pour verrouiller la roue jusqu'au lendemain.
--
-- 100 % idempotent (IF NOT EXISTS) : exécutable sans risque sur une base déjà
-- à jour.
-- =============================================================================

create table if not exists public.life_activities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  name       text not null default '',
  budget     numeric(14, 2) not null default 0,
  color      text not null default '#23D3A8',
  drawn      boolean not null default false,
  drawn_at   timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists life_activities_user_idx on public.life_activities (user_id);

-- met à jour updated_at automatiquement (fonction définie en 0001)
drop trigger if exists life_activities_set_updated_at on public.life_activities;
create trigger life_activities_set_updated_at
  before update on public.life_activities
  for each row execute function public.set_updated_at();

-- L'API se connecte en service_role (contourne la RLS). On active la RLS sans
-- policy : tout accès client direct (clé anon) est refusé par défaut.
alter table public.life_activities enable row level security;
