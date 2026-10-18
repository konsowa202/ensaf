-- 0015: competitor-parity fields (AxiaFunder / LexShares style)
-- 1) Legal team + insurance columns on cases
-- 2) case_updates feed (staff-posted case progress updates for investors)

alter table public.cases
  add column if not exists lawyer_name text,
  add column if not exists law_firm text,
  add column if not exists engagement_type text check (engagement_type in ('contingency','hourly','hybrid') or engagement_type is null),
  add column if not exists insurance_coverage_pct numeric(5,2) check (insurance_coverage_pct between 0 and 100 or insurance_coverage_pct is null);

create table if not exists public.case_updates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title_ar text not null,
  title_en text,
  body_ar text not null,
  body_en text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.case_updates enable row level security;

-- investors in the case, the case owner, and staff (cases.view) can read public updates;
-- non-public updates are staff-only.
create policy case_updates_select on public.case_updates for select to authenticated using (
  (is_public and (
    exists (select 1 from public.investments i where i.case_id = case_updates.case_id and i.investor_id = auth.uid())
    or exists (select 1 from public.cases c where c.id = case_updates.case_id and c.applicant_id = auth.uid())
    or public.has_permission(auth.uid(), 'cases.view')
  ))
  or public.has_permission(auth.uid(), 'cases.view')
);

-- only case managers / admins post updates
create policy case_updates_insert on public.case_updates for insert to authenticated with check (
  public.has_permission(auth.uid(), 'cases.manage')
);

create policy case_updates_delete on public.case_updates for delete to authenticated using (
  public.has_permission(auth.uid(), 'cases.manage')
);

create index if not exists case_updates_case_id_idx on public.case_updates(case_id, created_at desc);
