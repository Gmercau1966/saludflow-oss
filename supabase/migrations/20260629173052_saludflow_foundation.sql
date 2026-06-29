create table public.cases (
  id text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('web_form', 'seed_fixture', 'email')),
  category text not null check (
    category in (
      'Cambio de datos',
      'Documentación incompleta',
      'Reembolso',
      'Cambio de cita',
      'Reclamación administrativa',
      'Consulta sobre un procedimiento'
    )
  ),
  subject text not null check (char_length(subject) between 10 and 120),
  description text not null check (char_length(description) between 30 and 2000),
  related_date date null,
  status text not null check (
    status in (
      'pending',
      'analyzing',
      'human_review',
      'approved',
      'rejected',
      'escalated',
      'completed'
    )
  ),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  requires_human_review boolean not null,
  declared_priority text not null check (declared_priority in ('normal', 'urgent')),
  preferred_response_channel text not null check (
    preferred_response_channel in ('portal', 'email_simulated')
  ),
  synthetic boolean not null default true check (synthetic is true),
  received_at timestamptz not null,
  case_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  workflow_version text not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  input_snapshot jsonb not null,
  output_snapshot jsonb null,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default now(),
  foreign key (owner_id, case_id) references public.cases (owner_id, id) on delete cascade
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  event_type text not null,
  actor text not null,
  description text not null,
  workflow_version text not null,
  result jsonb null,
  created_at timestamptz not null default now(),
  foreign key (owner_id, case_id) references public.cases (owner_id, id) on delete cascade
);

create table public.human_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  decision text not null check (
    decision in ('approve', 'edit_and_approve', 'reject', 'escalate')
  ),
  reviewer text not null check (reviewer = 'Usuario demo'),
  note text not null,
  edited_draft text null,
  created_at timestamptz not null default now(),
  foreign key (owner_id, case_id) references public.cases (owner_id, id) on delete cascade
);

create index cases_owner_received_idx on public.cases (owner_id, received_at desc);
create index cases_owner_status_idx on public.cases (owner_id, status);
create index cases_owner_source_idx on public.cases (owner_id, source);
create index cases_owner_risk_idx on public.cases (owner_id, risk_level);
create index workflow_runs_owner_case_idx on public.workflow_runs (owner_id, case_id);
create index audit_events_owner_case_created_idx on public.audit_events (
  owner_id,
  case_id,
  created_at
);
create index human_reviews_owner_case_created_idx on public.human_reviews (
  owner_id,
  case_id,
  created_at
);

alter table public.cases enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.audit_events enable row level security;
alter table public.human_reviews enable row level security;

create policy "case owners can read cases" on public.cases
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "case owners can create cases" on public.cases
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "case owners can update cases" on public.cases
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "case owners can delete cases" on public.cases
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "case owners can read workflow runs" on public.workflow_runs
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "case owners can create workflow runs" on public.workflow_runs
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "case owners can update workflow runs" on public.workflow_runs
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "case owners can read audit events" on public.audit_events
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "case owners can append audit events" on public.audit_events
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "case owners can read human reviews" on public.human_reviews
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "case owners can append human reviews" on public.human_reviews
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

revoke all privileges on table public.cases
from anon, authenticated;

revoke all privileges on table public.workflow_runs
from anon, authenticated;

revoke all privileges on table public.audit_events
from anon, authenticated;

revoke all privileges on table public.human_reviews
from anon, authenticated;

grant select, insert, update, delete on table public.cases to authenticated;
grant select, insert, update on table public.workflow_runs to authenticated;
grant select, insert on table public.audit_events to authenticated;
grant select, insert on table public.human_reviews to authenticated;
