-- =============================================================================
-- MyFinance — Migration 0004 : champ "détail" optionnel sur les activités "Life"
--
-- (L'emoji, affiché seul sur la roue qui tourne, est géré par la migration 0003.)
-- Colonne facultative conservée pour compat : le backend la tolère, l'UI ne la
-- saisit pas.
--
-- 100 % idempotent (IF NOT EXISTS).
-- =============================================================================

alter table public.life_activities add column if not exists detail text not null default '';
