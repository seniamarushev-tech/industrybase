create extension if not exists "uuid-ossp";

create type public.role_type as enum ('artist', 'producer', 'customer');
create type public.budget_type as enum ('fixed', 'range', 'collab');
create type public.task_visibility as enum ('public', 'targeted');
create type public.task_status as enum ('open', 'matched', 'completed', 'disputed');
create type public.offer_status as enum ('sent', 'accepted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role role_type not null,
  city text not null,
  tags text[] not null default '{}',
  display_name text not null,
  contact_email text,
  contact_phone text,
  contact_telegram text,
  trust_score numeric(4,2) default 0,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  city text not null,
  event_date date,
  budget_type budget_type not null,
  budget_min numeric(12,2) not null,
  budget_max numeric(12,2),
  description text not null,
  visibility task_visibility not null default 'public',
  targeted_profile_id uuid references public.profiles(id),
  status task_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint budget_required check ((budget_type = 'collab') or (budget_min > 0)),
  constraint budget_range_valid check (budget_max is null or budget_max >= budget_min)
);

create table public.offers (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  portfolio_url text,
  status offer_status not null default 'sent',
  created_at timestamptz not null default now(),
  unique(task_id, proposer_id)
);

create table public.connections (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  a_id uuid not null references public.profiles(id) on delete cascade,
  b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (a_id <> b_id)
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  flags text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  unique(task_id, from_id)
);

create index tasks_market_idx on public.tasks(status, created_at desc);
create index tasks_filter_idx on public.tasks(category, city, budget_type, budget_min);
create index offers_task_idx on public.offers(task_id, created_at desc);
create index reviews_to_id_idx on public.reviews(to_id);

create or replace function public.get_trust_score(profile_id uuid)
returns table(
  closed_count bigint,
  completion_rate numeric,
  avg_rating numeric,
  flags_count bigint
)
language sql
security definer
set search_path = public
as $$
  with t as (
    select
      count(*) filter (where status in ('completed','disputed')) as closed_count,
      count(*) filter (where status = 'completed') as completed_count
    from public.tasks
    where creator_id = profile_id
  ),
  r as (
    select coalesce(avg(rating), 0)::numeric(4,2) as avg_rating,
           coalesce(sum(cardinality(flags)),0) as flags_count
    from public.reviews
    where to_id = profile_id
  )
  select
    t.closed_count,
    case when t.closed_count = 0 then 0 else (t.completed_count::numeric / t.closed_count) end as completion_rate,
    r.avg_rating,
    r.flags_count
  from t, r;
$$;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.offers enable row level security;
alter table public.connections enable row level security;
alter table public.reviews enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

create policy "tasks public read" on public.tasks
for select using (
  visibility = 'public' or creator_id = auth.uid() or targeted_profile_id = auth.uid()
);
create policy "tasks creator insert" on public.tasks
for insert with check (creator_id = auth.uid());
create policy "tasks creator update" on public.tasks
for update using (creator_id = auth.uid());

create policy "offers proposer create" on public.offers
for insert with check (proposer_id = auth.uid());
create policy "offers read creator and proposer" on public.offers
for select using (
  proposer_id = auth.uid() or exists (
    select 1 from public.tasks t where t.id = task_id and t.creator_id = auth.uid()
  )
);
create policy "offers creator update" on public.offers
for update using (
  exists (select 1 from public.tasks t where t.id = task_id and t.creator_id = auth.uid())
);

create policy "connections participants read" on public.connections
for select using (a_id = auth.uid() or b_id = auth.uid());
create policy "connections creator create" on public.connections
for insert with check (a_id = auth.uid() or b_id = auth.uid());

create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews connected create" on public.reviews
for insert with check (
  from_id = auth.uid()
  and exists (
    select 1 from public.connections c
    where c.task_id = reviews.task_id
      and (c.a_id = auth.uid() or c.b_id = auth.uid())
      and (c.a_id = to_id or c.b_id = to_id)
  )
);
