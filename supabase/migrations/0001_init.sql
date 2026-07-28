-- ===========================================================================
-- fritz-kola Scoreboard – Initiale Migration
-- Tabellen, Trigger, Row Level Security und Seed
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelle: profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text not null,
  rolle      text not null default 'asm' check (rolle in ('asm', 'admin')),
  gebiet     text,
  aktiv      boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabelle: jahresziele
-- ---------------------------------------------------------------------------
create table if not exists public.jahresziele (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  jahr           int not null,
  neukunden_ziel int,
  bestand_kunden int,
  ziel_punkte    numeric not null,
  created_at     timestamptz not null default now(),
  unique (profile_id, jahr)
);

-- ---------------------------------------------------------------------------
-- Tabelle: kunden
-- ---------------------------------------------------------------------------
create table if not exists public.kunden (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  sap_nummer  text,
  name        text not null,
  strasse     text,
  plz         text,
  ort         text,
  betriebstyp text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabelle: bewegungen
-- ---------------------------------------------------------------------------
create table if not exists public.bewegungen (
  id           uuid primary key default gen_random_uuid(),
  kunde_id     uuid not null references public.kunden (id) on delete cascade,
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  jahr         int not null,
  typ          text not null check (typ in ('neulistung', 'exklusivdrehung', 'verlust')),
  datum        date not null,
  kisten_jahr  int not null,
  absatzstufe  text not null check (absatzstufe in ('wenig', 'mittel', 'hoch')),
  kundentyp    text check (kundentyp in ('mainstream', 'premium', 'influential')),
  exklusiv     boolean not null default false,
  verlustgrund text check (verlustgrund in ('wettbewerb', 'schliessung', 'insolvenz', 'sonstige')),
  notiz        text,
  ist_kam      boolean not null default false,
  punkte       numeric not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists bewegungen_profile_jahr_idx
  on public.bewegungen (profile_id, jahr);
create index if not exists bewegungen_kunde_idx
  on public.bewegungen (kunde_id);
create index if not exists kunden_profile_idx
  on public.kunden (profile_id);

-- ---------------------------------------------------------------------------
-- Tabelle: scoring_config
-- ---------------------------------------------------------------------------
create table if not exists public.scoring_config (
  id                              uuid primary key default gen_random_uuid(),
  jahr                            int not null unique,
  schwelle_mittel                 int not null default 250,
  schwelle_hoch                   int not null default 500,
  schwelle_kam                    int not null default 1000,
  punkte_wenig                    numeric not null default 1,
  punkte_mittel                   numeric not null default 2,
  punkte_hoch                     numeric not null default 3,
  punkte_mainstream               numeric not null default 0,
  punkte_premium                  numeric not null default 1,
  punkte_influential              numeric not null default 2,
  punkte_exklusiv                 numeric not null default 1,
  verlust_neutral_bei_schliessung boolean not null default true
);

-- ===========================================================================
-- Hilfsfunktionen und Trigger
-- ===========================================================================

-- security definer Hilfsfunktion: verhindert Rekursion in den Policies
create or replace function public.ist_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rolle = 'admin' and aktiv = true
  );
$$;

-- updated_at automatisch pflegen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bewegungen_set_updated_at on public.bewegungen;
create trigger bewegungen_set_updated_at
  before update on public.bewegungen
  for each row execute function public.set_updated_at();

-- jahr aus datum ableiten und gegen nachtraegliche Aenderung schuetzen
create or replace function public.bewegung_jahr_ableiten()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.jahr = extract(year from new.datum)::int;
  elsif tg_op = 'UPDATE' then
    -- jahr ist fest an das urspruengliche datum gebunden, nicht aenderbar
    new.jahr = old.jahr;
    new.datum = old.datum;
  end if;
  return new;
end;
$$;

drop trigger if exists bewegungen_jahr_ableiten on public.bewegungen;
create trigger bewegungen_jahr_ableiten
  before insert or update on public.bewegungen
  for each row execute function public.bewegung_jahr_ableiten();

-- Profil bei Registrierung anlegen, Domainpruefung, erster Nutzer wird Admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  erlaubte_domain text := current_setting('app.erlaubte_domain', true);
  ist_erster      boolean;
begin
  -- Domainpruefung (nur wenn eine Domain konfiguriert ist)
  if erlaubte_domain is not null and erlaubte_domain <> '' then
    if split_part(new.email, '@', 2) <> erlaubte_domain then
      raise exception 'Registrierung nur mit einer Adresse auf @% erlaubt', erlaubte_domain;
    end if;
  end if;

  select not exists (select 1 from public.profiles) into ist_erster;

  insert into public.profiles (id, email, full_name, rolle, aktiv)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when ist_erster then 'admin' else 'asm' end,
    case when ist_erster then true else false end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Domainpruefung auch direkt auf profiles (zweite Verteidigungslinie)
create or replace function public.profile_domain_pruefung()
returns trigger
language plpgsql
as $$
declare
  erlaubte_domain text := current_setting('app.erlaubte_domain', true);
begin
  if erlaubte_domain is not null and erlaubte_domain <> '' then
    if split_part(new.email, '@', 2) <> erlaubte_domain then
      raise exception 'E-Mail-Domain nicht erlaubt: nur @% zulaessig', erlaubte_domain;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_domain_pruefung on public.profiles;
create trigger profiles_domain_pruefung
  before insert on public.profiles
  for each row execute function public.profile_domain_pruefung();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles       enable row level security;
alter table public.jahresziele    enable row level security;
alter table public.kunden         enable row level security;
alter table public.bewegungen     enable row level security;
alter table public.scoring_config enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.ist_admin());

-- Nutzer duerfen eigene, nicht sicherheitsrelevante Felder aendern.
-- Rolle/aktiv/gebiet werden ausschliesslich vom Admin gepflegt (siehe Policy unten).
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.ist_admin())
  with check (public.ist_admin());

-- Insert erfolgt ausschliesslich ueber den security-definer Trigger handle_new_user.

-- ---------------------------------------------------------------------------
-- jahresziele
-- ---------------------------------------------------------------------------
create policy "jahresziele_select_self_or_admin"
  on public.jahresziele for select
  using (profile_id = auth.uid() or public.ist_admin());

create policy "jahresziele_admin_insert"
  on public.jahresziele for insert
  with check (public.ist_admin());

create policy "jahresziele_admin_update"
  on public.jahresziele for update
  using (public.ist_admin())
  with check (public.ist_admin());

create policy "jahresziele_admin_delete"
  on public.jahresziele for delete
  using (public.ist_admin());

-- ---------------------------------------------------------------------------
-- kunden
-- ---------------------------------------------------------------------------
create policy "kunden_select_own_or_admin"
  on public.kunden for select
  using (profile_id = auth.uid() or public.ist_admin());

create policy "kunden_insert_own"
  on public.kunden for insert
  with check (profile_id = auth.uid());

create policy "kunden_update_own"
  on public.kunden for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "kunden_delete_own"
  on public.kunden for delete
  using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- bewegungen
-- ---------------------------------------------------------------------------
create policy "bewegungen_select_own_or_admin"
  on public.bewegungen for select
  using (profile_id = auth.uid() or public.ist_admin());

create policy "bewegungen_insert_own"
  on public.bewegungen for insert
  with check (profile_id = auth.uid());

create policy "bewegungen_update_own"
  on public.bewegungen for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Loeschen nur innerhalb von 24 Stunden nach Anlage
create policy "bewegungen_delete_own_24h"
  on public.bewegungen for delete
  using (
    profile_id = auth.uid()
    and created_at > now() - interval '24 hours'
  );

-- ---------------------------------------------------------------------------
-- scoring_config
-- ---------------------------------------------------------------------------
create policy "scoring_config_select_all_authenticated"
  on public.scoring_config for select
  using (auth.uid() is not null);

create policy "scoring_config_admin_insert"
  on public.scoring_config for insert
  with check (public.ist_admin());

create policy "scoring_config_admin_update"
  on public.scoring_config for update
  using (public.ist_admin())
  with check (public.ist_admin());

-- ===========================================================================
-- Seed: scoring_config fuer das laufende Jahr
-- ===========================================================================
insert into public.scoring_config (jahr)
values (extract(year from now())::int)
on conflict (jahr) do nothing;
