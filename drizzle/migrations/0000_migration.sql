
-- ===== ENUMS =====
create type public.app_role as enum ('super_admin','admin_aponto','gestor_aponto','rh_aponto','gestor_empresa','empresa','profissional');
create type public.work_modality as enum ('fixo','freelancer','ambos');
create type public.job_status as enum ('rascunho','publicada','pausada','encerrada');
create type public.application_stage as enum ('candidatura','triagem','contato','entrevista','aprovacao','documentos','contratacao','ativo','reprovado','desistiu');
create type public.freela_status as enum ('rascunho','publicada','interessados','selecionados','confirmada','em_andamento','concluida','cancelada');
create type public.freela_app_status as enum ('interessado','sem_interesse','selecionado','recusado');
create type public.assignment_status as enum ('convidado','aceito','reservado','em_execucao','aguardando_aprovacao','aprovado','reprovado','cancelado');
create type public.doc_status as enum ('pendente','enviado','analise','aprovado','recusado','expirado');
create type public.pay_unit as enum ('diaria','hora','atividade');

-- ===== PROFILES & ROLES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  lgpd_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','admin_aponto','gestor_aponto','rh_aponto'))
$$;

-- ===== COMPANIES =====
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 160),
  cnpj text,
  city text,
  segment text,
  settings jsonb not null default '{"nao_vende_requer_confirmacao":true,"atividade_nao_minha_executada":false}'::jsonb,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.companies to authenticated;
grant all on public.companies to service_role;
alter table public.companies enable row level security;

create table public.company_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  role public.app_role not null default 'empresa',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create index on public.company_users(user_id);
grant select, insert, delete on public.company_users to authenticated;
grant all on public.company_users to service_role;
alter table public.company_users enable row level security;

create or replace function public.is_company_member(_user_id uuid, _company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_users where user_id = _user_id and company_id = _company_id)
$$;
create or replace function public.is_any_company_member(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_users where user_id = _user_id)
$$;

-- ===== PROFESSIONALS =====
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text not null default '',
  cpf text,
  phone text,
  email text,
  city text,
  region text,
  address text,
  photo_url text,
  headline text,
  education text,
  modality public.work_modality,
  salary_expectation numeric(10,2),
  rate_hour numeric(10,2),
  rate_day numeric(10,2),
  rate_activity numeric(10,2),
  immediate_availability boolean not null default false,
  travel_radius_km int not null default 10 check (travel_radius_km between 0 and 500),
  has_vehicle boolean not null default false,
  lat double precision,
  lng double precision,
  talent_pool_consent boolean not null default true,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.professionals to authenticated;
grant all on public.professionals to service_role;
alter table public.professionals enable row level security;

create or replace function public.my_professional_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.professionals where user_id = auth.uid()
$$;

create table public.professional_experiences (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  company_name text not null,
  role_title text not null,
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now()
);
create index on public.professional_experiences(professional_id);
grant select, insert, update, delete on public.professional_experiences to authenticated;
grant all on public.professional_experiences to service_role;
alter table public.professional_experiences enable row level security;

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text
);
grant select, insert on public.skills to authenticated;
grant all on public.skills to service_role;
alter table public.skills enable row level security;

create table public.professional_skills (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int not null default 3 check (level between 1 and 5),
  primary key (professional_id, skill_id)
);
grant select, insert, update, delete on public.professional_skills to authenticated;
grant all on public.professional_skills to service_role;
alter table public.professional_skills enable row level security;

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  kind text not null default 'livre' check (kind in ('livre','fixo')),
  region text,
  check (end_time > start_time)
);
create index on public.availability(professional_id);
grant select, insert, update, delete on public.availability to authenticated;
grant all on public.availability to service_role;
alter table public.availability enable row level security;

create or replace function public.prevent_availability_overlap()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.availability a where a.professional_id = new.professional_id
     and a.weekday = new.weekday and a.id <> new.id
     and a.start_time < new.end_time and new.start_time < a.end_time) then
    raise exception 'Conflito de agenda: já existe um horário cadastrado que se sobrepõe neste dia.';
  end if;
  return new;
end $$;
create trigger trg_availability_overlap before insert or update on public.availability
for each row execute function public.prevent_availability_overlap();

-- ===== JOBS (TRABALHO FIXO) =====
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null check (length(title) between 3 and 140),
  description text not null default '',
  requirements text,
  salary numeric(10,2),
  benefits text,
  workload text,
  schedule text,
  city text,
  openings int not null default 1 check (openings > 0),
  start_date date,
  status public.job_status not null default 'publicada',
  created_by uuid not null,
  published_at timestamptz default now(),
  created_at timestamptz not null default now()
);
create index on public.jobs(company_id);
create index on public.jobs(status);
grant select on public.jobs to anon;
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  stage public.application_stage not null default 'candidatura',
  notes text,
  first_contact_at timestamptz,
  interview_at timestamptz,
  approved_at timestamptz,
  hired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, professional_id)
);
create index on public.applications(professional_id);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;

create or replace function public.job_company(_job_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.jobs where id = _job_id
$$;

create table public.recruitment_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_stage public.application_stage,
  to_stage public.application_stage,
  kind text not null default 'etapa' check (kind in ('etapa','contato','nota')),
  channel text,
  result text,
  next_contact_at timestamptz,
  note text,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index on public.recruitment_history(application_id);
grant select, insert on public.recruitment_history to authenticated;
grant all on public.recruitment_history to service_role;
alter table public.recruitment_history enable row level security;

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  interviewer text,
  status text not null default 'agendada' check (status in ('agendada','realizada','reagendada','faltou','cancelada')),
  result text check (result in ('aprovado','reprovado','pendente')),
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index on public.interviews(application_id);
grant select, insert, update on public.interviews to authenticated;
grant all on public.interviews to service_role;
alter table public.interviews enable row level security;

create or replace function public.application_company(_app_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select j.company_id from public.applications a join public.jobs j on j.id = a.job_id where a.id = _app_id
$$;
create or replace function public.application_owner(_app_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select p.user_id from public.applications a join public.professionals p on p.id = a.professional_id where a.id = _app_id
$$;

-- stage change trigger: history + SLA timestamps
create or replace function public.on_application_stage()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stage is distinct from old.stage then
    insert into public.recruitment_history(application_id, from_stage, to_stage, kind, actor_id)
    values (new.id, old.stage, new.stage, 'etapa', auth.uid());
    if new.stage = 'contato' and new.first_contact_at is null then new.first_contact_at := now(); end if;
    if new.stage = 'aprovacao' and new.approved_at is null then new.approved_at := now(); end if;
    if new.stage in ('contratacao','ativo') and new.hired_at is null then new.hired_at := now(); end if;
    insert into public.notifications(user_id, title, body, link)
    select p.user_id, 'Sua candidatura avançou', 'Nova etapa: ' || new.stage::text, '/app/candidaturas'
    from public.professionals p where p.id = new.professional_id;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ===== DOCUMENTS =====
create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  requires_expiry boolean not null default false
);
grant select on public.document_types to authenticated;
grant all on public.document_types to service_role;
alter table public.document_types enable row level security;
insert into public.document_types(name, requires_expiry) values
 ('RG ou CNH', true), ('CPF', false), ('Comprovante de residência', false), ('Carteira de trabalho', false),
 ('Certificado de treinamento', true), ('ASO / Exame admissional', true);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  document_type_id uuid references public.document_types(id),
  name text not null,
  file_path text,
  status public.doc_status not null default 'enviado',
  expires_at date,
  review_note text,
  reviewed_by uuid,
  created_at timestamptz not null default now()
);
create index on public.documents(professional_id);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;

-- ===== STORES =====
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  address text,
  city text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);
create index on public.stores(company_id);
grant select, insert, update, delete on public.stores to authenticated;
grant all on public.stores to service_role;
alter table public.stores enable row level security;

-- ===== FREELANCE =====
create table public.freelance_opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  title text not null check (length(title) between 3 and 140),
  description text not null default '',
  activity_type text not null,
  location_name text,
  address text,
  city text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  slots int not null default 1 check (slots > 0),
  pay_amount numeric(10,2) not null check (pay_amount >= 0),
  pay_unit public.pay_unit not null default 'diaria',
  requirements text,
  required_skills text[] not null default '{}',
  min_experience_months int not null default 0,
  radius_km int not null default 20,
  requires_vehicle boolean not null default false,
  requires_uniform boolean not null default false,
  notes text,
  status public.freela_status not null default 'publicada',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index on public.freelance_opportunities(company_id);
create index on public.freelance_opportunities(status, starts_at);
grant select, insert, update, delete on public.freelance_opportunities to authenticated;
grant all on public.freelance_opportunities to service_role;
alter table public.freelance_opportunities enable row level security;

create or replace function public.opportunity_company(_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.freelance_opportunities where id = _id
$$;

create table public.freelance_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.freelance_opportunities(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  status public.freela_app_status not null default 'interessado',
  match_score int,
  created_at timestamptz not null default now(),
  unique (opportunity_id, professional_id)
);
create index on public.freelance_applications(professional_id);
grant select, insert, update on public.freelance_applications to authenticated;
grant all on public.freelance_applications to service_role;
alter table public.freelance_applications enable row level security;

create table public.freelance_assignments (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.freelance_opportunities(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.assignment_status not null default 'convidado',
  checkin_at timestamptz, checkin_lat double precision, checkin_lng double precision,
  checkout_at timestamptz, checkout_lat double precision, checkout_lng double precision,
  execution_result text check (execution_result in ('concluida','ruptura_total','nao_vende_confirmado','nao_vende_pendente','atividade_nao_minha')),
  executed boolean,
  report text,
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz not null default now(),
  unique (opportunity_id, professional_id)
);
create index on public.freelance_assignments(professional_id, starts_at);
create index on public.freelance_assignments(company_id);
grant select, insert, update on public.freelance_assignments to authenticated;
grant all on public.freelance_assignments to service_role;
alter table public.freelance_assignments enable row level security;

create or replace function public.prevent_assignment_overlap()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status in ('cancelado','reprovado') then return new; end if;
  if exists (select 1 from public.freelance_assignments a
     where a.professional_id = new.professional_id and a.id <> new.id
       and a.status not in ('cancelado','reprovado','convidado')
       and a.starts_at < new.ends_at and new.starts_at < a.ends_at) then
    raise exception 'Conflito de agenda: o profissional já tem um trabalho reservado neste horário.';
  end if;
  if exists (select 1 from public.availability v
     where v.professional_id = new.professional_id and v.kind = 'fixo'
       and v.weekday = extract(dow from (new.starts_at at time zone 'America/Sao_Paulo'))::int
       and v.start_time < (new.ends_at at time zone 'America/Sao_Paulo')::time
       and (new.starts_at at time zone 'America/Sao_Paulo')::time < v.end_time) then
    raise exception 'Conflito de agenda: horário coincide com a jornada do trabalho fixo do profissional.';
  end if;
  return new;
end $$;
create trigger trg_assignment_overlap before insert or update of starts_at, ends_at, status on public.freelance_assignments
for each row execute function public.prevent_assignment_overlap();

create table public.freelance_evidence (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.freelance_assignments(id) on delete cascade,
  kind text not null check (kind in ('antes','depois','loja','exposicao','produto','atividade','comprovante')),
  file_path text not null,
  sku text,
  note text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create index on public.freelance_evidence(assignment_id);
grant select, insert, delete on public.freelance_evidence to authenticated;
grant all on public.freelance_evidence to service_role;
alter table public.freelance_evidence enable row level security;

create table public.freelance_reviews (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.freelance_assignments(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  pontualidade int not null check (pontualidade between 1 and 5),
  execucao int not null check (execucao between 1 and 5),
  qualidade int not null check (qualidade between 1 and 5),
  postura int not null check (postura between 1 and 5),
  organizacao int not null check (organizacao between 1 and 5),
  evidencias int not null check (evidencias between 1 and 5),
  cumprimento int not null check (cumprimento between 1 and 5),
  comment text,
  reviewer_id uuid not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.freelance_reviews to authenticated;
grant all on public.freelance_reviews to service_role;
alter table public.freelance_reviews enable row level security;

create table public.freelance_earnings (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.freelance_assignments(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null default 'previsto' check (status in ('previsto','aprovado','pago','pendente','cancelado')),
  activity_type text,
  reference_date date not null,
  created_at timestamptz not null default now()
);
create index on public.freelance_earnings(professional_id);
grant select on public.freelance_earnings to authenticated;
grant all on public.freelance_earnings to service_role;
alter table public.freelance_earnings enable row level security;

-- ===== NOTIFICATIONS / AUDIT =====
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  company_id uuid,
  table_name text not null,
  record_id uuid,
  action text not null,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs(company_id, created_at desc);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;

create or replace function public.audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare rec jsonb; cid uuid;
begin
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  cid := nullif(rec->>'company_id','')::uuid;
  insert into public.audit_logs(actor_id, company_id, table_name, record_id, action, changes)
  values (auth.uid(), cid, tg_table_name, nullif(rec->>'id','')::uuid, tg_op,
    case when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)) else rec end);
  return null;
end $$;

create trigger trg_app_stage before update on public.applications for each row execute function public.on_application_stage();

do $$ declare t text; begin
  foreach t in array array['jobs','applications','companies','freelance_opportunities','freelance_assignments','documents','freelance_reviews','interviews'] loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_trigger()', t);
  end loop;
end $$;

-- earnings + reputation
create or replace function public.on_assignment_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare o record; amt numeric;
begin
  select * into o from public.freelance_opportunities where id = new.opportunity_id;
  amt := case o.pay_unit when 'hora' then o.pay_amount * greatest(1, round(extract(epoch from (new.ends_at - new.starts_at))/3600)) else o.pay_amount end;
  if new.status in ('reservado','aceito') and not exists (select 1 from public.freelance_earnings where assignment_id = new.id) then
    insert into public.freelance_earnings(assignment_id, professional_id, company_id, amount, status, activity_type, reference_date)
    values (new.id, new.professional_id, new.company_id, amt, 'previsto', o.activity_type, (new.starts_at at time zone 'America/Sao_Paulo')::date);
  end if;
  if new.status = 'aprovado' then
    update public.freelance_earnings set status = 'aprovado' where assignment_id = new.id;
  elsif new.status in ('cancelado','reprovado') then
    update public.freelance_earnings set status = 'cancelado' where assignment_id = new.id;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.notifications(user_id, title, body, link)
    select p.user_id, 'Trabalho atualizado: ' || o.title, 'Status: ' || new.status::text, '/app/checkin'
    from public.professionals p where p.id = new.professional_id;
  elsif tg_op = 'INSERT' then
    insert into public.notifications(user_id, title, body, link)
    select p.user_id, 'Você foi selecionado!', 'Convite para: ' || o.title || '. Confirme seu aceite.', '/app/checkin'
    from public.professionals p where p.id = new.professional_id;
  end if;
  return null;
end $$;
create trigger trg_assignment_change after insert or update on public.freelance_assignments
for each row execute function public.on_assignment_change();

create or replace function public.on_review_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.professionals p set
    rating_count = s.c, rating_avg = s.a
  from (select count(*) c, avg((pontualidade+execucao+qualidade+postura+organizacao+evidencias+cumprimento)/7.0) a
        from public.freelance_reviews where professional_id = new.professional_id) s
  where p.id = new.professional_id;
  return null;
end $$;
create trigger trg_review_insert after insert on public.freelance_reviews for each row execute function public.on_review_insert();

-- ===== SIGNUP =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email, lgpd_consent_at)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.email,
    case when (new.raw_user_meta_data->>'lgpd_consent') = 'true' then now() else null end);
  if coalesce(new.raw_user_meta_data->>'account_type','profissional') = 'profissional' then
    insert into public.user_roles(user_id, role) values (new.id, 'profissional') on conflict do nothing;
    insert into public.professionals(user_id, full_name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.email);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== RPCs =====
create or replace function public.create_company(_name text, _cnpj text, _city text, _segment text)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if length(coalesce(_name,'')) < 2 then raise exception 'Nome da empresa inválido'; end if;
  insert into public.companies(name, cnpj, city, segment, created_by) values (_name, _cnpj, _city, _segment, auth.uid()) returning id into cid;
  insert into public.company_users(company_id, user_id, role) values (cid, auth.uid(), 'gestor_empresa');
  insert into public.user_roles(user_id, role) values (auth.uid(), 'gestor_empresa') on conflict do nothing;
  insert into public.user_roles(user_id, role) values (auth.uid(), 'empresa') on conflict do nothing;
  return cid;
end $$;

create or replace function public.become_professional()
returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  insert into public.user_roles(user_id, role) values (auth.uid(), 'profissional') on conflict do nothing;
  insert into public.professionals(user_id, full_name, email)
  select id, full_name, email from public.profiles where id = auth.uid()
  on conflict (user_id) do nothing;
  select id into pid from public.professionals where user_id = auth.uid();
  return pid;
end $$;

create or replace function public.select_freelancer(_application_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare fa record; o record; aid uuid;
begin
  select * into fa from public.freelance_applications where id = _application_id;
  if fa is null then raise exception 'Candidatura não encontrada'; end if;
  select * into o from public.freelance_opportunities where id = fa.opportunity_id;
  if not (public.is_company_member(auth.uid(), o.company_id) or public.is_staff(auth.uid())) then
    raise exception 'Sem permissão';
  end if;
  insert into public.freelance_assignments(opportunity_id, professional_id, company_id, starts_at, ends_at, status)
  values (o.id, fa.professional_id, o.company_id, o.starts_at, o.ends_at, 'convidado') returning id into aid;
  update public.freelance_applications set status = 'selecionado' where id = _application_id;
  if o.status in ('publicada','interessados') then update public.freelance_opportunities set status = 'selecionados' where id = o.id; end if;
  return aid;
end $$;

create or replace function public.freela_respond(_assignment_id uuid, _accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare a record;
begin
  select * into a from public.freelance_assignments where id = _assignment_id;
  if a is null or a.professional_id <> public.my_professional_id() then raise exception 'Sem permissão'; end if;
  if a.status <> 'convidado' then raise exception 'Convite não está mais pendente'; end if;
  update public.freelance_assignments set status = case when _accept then 'reservado'::assignment_status else 'cancelado'::assignment_status end where id = _assignment_id;
end $$;

create or replace function public.freela_checkin(_assignment_id uuid, _lat double precision, _lng double precision)
returns void language plpgsql security definer set search_path = public as $$
declare a record;
begin
  select * into a from public.freelance_assignments where id = _assignment_id;
  if a is null or a.professional_id <> public.my_professional_id() then raise exception 'Sem permissão'; end if;
  if a.status <> 'reservado' then raise exception 'Check-in disponível apenas para trabalhos reservados'; end if;
  update public.freelance_assignments set status = 'em_execucao', checkin_at = now(), checkin_lat = _lat, checkin_lng = _lng where id = _assignment_id;
  update public.freelance_opportunities set status = 'em_andamento' where id = a.opportunity_id and status in ('selecionados','confirmada','publicada','interessados');
end $$;

create or replace function public.freela_checkout(_assignment_id uuid, _lat double precision, _lng double precision, _result text, _report text)
returns void language plpgsql security definer set search_path = public as $$
declare a record; ev int; exe boolean;
begin
  select * into a from public.freelance_assignments where id = _assignment_id;
  if a is null or a.professional_id <> public.my_professional_id() then raise exception 'Sem permissão'; end if;
  if a.status <> 'em_execucao' then raise exception 'Faça o check-in antes do check-out'; end if;
  select count(*) into ev from public.freelance_evidence where assignment_id = _assignment_id;
  if ev = 0 then raise exception 'Envie ao menos uma evidência antes do check-out'; end if;
  -- Regras A Ponto
  exe := case _result when 'concluida' then true when 'ruptura_total' then true
           when 'nao_vende_confirmado' then true when 'nao_vende_pendente' then false
           when 'atividade_nao_minha' then false else null end;
  if exe is null then raise exception 'Resultado de execução inválido'; end if;
  update public.freelance_assignments set status = 'aguardando_aprovacao', checkout_at = now(), checkout_lat = _lat, checkout_lng = _lng,
    execution_result = _result, executed = exe, report = _report where id = _assignment_id;
end $$;

grant execute on function public.create_company, public.become_professional, public.select_freelancer, public.freela_respond, public.freela_checkin, public.freela_checkout to authenticated;

-- ===== POLICIES =====
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile write" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create policy "companies read" on public.companies for select to authenticated using (true);
create policy "companies update" on public.companies for update to authenticated using (public.is_company_member(auth.uid(), id) or public.is_staff(auth.uid()));

create policy "cu read" on public.company_users for select to authenticated using (user_id = auth.uid() or public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));
create policy "cu manage" on public.company_users for insert to authenticated with check (public.has_role(auth.uid(),'gestor_empresa') and public.is_company_member(auth.uid(), company_id));
create policy "cu delete" on public.company_users for delete to authenticated using (public.has_role(auth.uid(),'gestor_empresa') and public.is_company_member(auth.uid(), company_id) and user_id <> auth.uid());

create policy "prof own" on public.professionals for select to authenticated using (
  user_id = auth.uid() or public.is_staff(auth.uid()) or (talent_pool_consent and public.is_any_company_member(auth.uid())));
create policy "prof insert" on public.professionals for insert to authenticated with check (user_id = auth.uid());
create policy "prof update" on public.professionals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "exp read" on public.professional_experiences for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_staff(auth.uid()) or public.is_any_company_member(auth.uid()));
create policy "exp write" on public.professional_experiences for all to authenticated using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "skills read" on public.skills for select to authenticated using (true);
create policy "skills insert" on public.skills for insert to authenticated with check (length(name) between 2 and 60);
create policy "pskills read" on public.professional_skills for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_staff(auth.uid()) or public.is_any_company_member(auth.uid()));
create policy "pskills write" on public.professional_skills for all to authenticated using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "avail read" on public.availability for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_staff(auth.uid()) or public.is_any_company_member(auth.uid()));
create policy "avail write" on public.availability for all to authenticated using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "jobs public read" on public.jobs for select to anon, authenticated using (status = 'publicada' or (auth.uid() is not null and (public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()))));
create policy "jobs insert" on public.jobs for insert to authenticated with check (public.is_company_member(auth.uid(), company_id) and created_by = auth.uid());
create policy "jobs update" on public.jobs for update to authenticated using (public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));
create policy "jobs delete" on public.jobs for delete to authenticated using (public.is_company_member(auth.uid(), company_id));

create policy "apps read" on public.applications for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_company_member(auth.uid(), public.job_company(job_id)) or public.is_staff(auth.uid()));
create policy "apps insert" on public.applications for insert to authenticated with check (professional_id = public.my_professional_id() and stage = 'candidatura');
create policy "apps update" on public.applications for update to authenticated using (
  public.is_company_member(auth.uid(), public.job_company(job_id)) or public.is_staff(auth.uid()));

create policy "rh read" on public.recruitment_history for select to authenticated using (
  public.application_owner(application_id) = auth.uid() or public.is_company_member(auth.uid(), public.application_company(application_id)) or public.is_staff(auth.uid()));
create policy "rh insert" on public.recruitment_history for insert to authenticated with check (
  actor_id = auth.uid() and (public.is_company_member(auth.uid(), public.application_company(application_id)) or public.is_staff(auth.uid())));

create policy "int read" on public.interviews for select to authenticated using (
  public.application_owner(application_id) = auth.uid() or public.is_company_member(auth.uid(), public.application_company(application_id)) or public.is_staff(auth.uid()));
create policy "int write" on public.interviews for insert to authenticated with check (
  public.is_company_member(auth.uid(), public.application_company(application_id)) or public.is_staff(auth.uid()));
create policy "int update" on public.interviews for update to authenticated using (
  public.is_company_member(auth.uid(), public.application_company(application_id)) or public.is_staff(auth.uid()));

create policy "doctypes read" on public.document_types for select to authenticated using (true);
create policy "docs read" on public.documents for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_staff(auth.uid())
  or exists (select 1 from public.applications a join public.jobs j on j.id = a.job_id
             where a.professional_id = documents.professional_id and public.is_company_member(auth.uid(), j.company_id)
               and a.stage in ('aprovacao','documentos','contratacao','ativo')));
create policy "docs insert" on public.documents for insert to authenticated with check (professional_id = public.my_professional_id() and status = 'enviado');
create policy "docs own delete" on public.documents for delete to authenticated using (professional_id = public.my_professional_id() and status <> 'aprovado');
create policy "docs review" on public.documents for update to authenticated using (
  public.is_staff(auth.uid()) or exists (select 1 from public.applications a join public.jobs j on j.id = a.job_id
             where a.professional_id = documents.professional_id and public.is_company_member(auth.uid(), j.company_id)));

create policy "stores read" on public.stores for select to authenticated using (true);
create policy "stores write" on public.stores for all to authenticated using (public.is_company_member(auth.uid(), company_id)) with check (public.is_company_member(auth.uid(), company_id));

create policy "fo read" on public.freelance_opportunities for select to authenticated using (
  status not in ('rascunho','cancelada') or public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));
create policy "fo insert" on public.freelance_opportunities for insert to authenticated with check (public.is_company_member(auth.uid(), company_id) and created_by = auth.uid());
create policy "fo update" on public.freelance_opportunities for update to authenticated using (public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));
create policy "fo delete" on public.freelance_opportunities for delete to authenticated using (public.is_company_member(auth.uid(), company_id) and status = 'rascunho');

create policy "fa read" on public.freelance_applications for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_company_member(auth.uid(), public.opportunity_company(opportunity_id)) or public.is_staff(auth.uid()));
create policy "fa insert" on public.freelance_applications for insert to authenticated with check (professional_id = public.my_professional_id() and status in ('interessado','sem_interesse'));
create policy "fa update own" on public.freelance_applications for update to authenticated using (
  (professional_id = public.my_professional_id() and status in ('interessado','sem_interesse'))
  or public.is_company_member(auth.uid(), public.opportunity_company(opportunity_id)));

create policy "fas read" on public.freelance_assignments for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));
create policy "fas company update" on public.freelance_assignments for update to authenticated using (public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));

create policy "ev read" on public.freelance_evidence for select to authenticated using (
  exists (select 1 from public.freelance_assignments a where a.id = assignment_id and
    (a.professional_id = public.my_professional_id() or public.is_company_member(auth.uid(), a.company_id) or public.is_staff(auth.uid()))));
create policy "ev insert" on public.freelance_evidence for insert to authenticated with check (
  created_by = auth.uid() and exists (select 1 from public.freelance_assignments a where a.id = assignment_id
    and a.professional_id = public.my_professional_id() and a.status = 'em_execucao'));
create policy "ev delete" on public.freelance_evidence for delete to authenticated using (created_by = auth.uid()
  and exists (select 1 from public.freelance_assignments a where a.id = assignment_id and a.status = 'em_execucao'));

create policy "rev read" on public.freelance_reviews for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_staff(auth.uid())
  or exists (select 1 from public.freelance_assignments a where a.id = assignment_id and public.is_company_member(auth.uid(), a.company_id)));
create policy "rev insert" on public.freelance_reviews for insert to authenticated with check (
  reviewer_id = auth.uid() and exists (select 1 from public.freelance_assignments a where a.id = assignment_id
    and a.professional_id = freelance_reviews.professional_id and a.status = 'aprovado' and public.is_company_member(auth.uid(), a.company_id)));

create policy "earn read" on public.freelance_earnings for select to authenticated using (
  professional_id = public.my_professional_id() or public.is_company_member(auth.uid(), company_id) or public.is_staff(auth.uid()));

create policy "notif own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif own update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "notif own delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create policy "audit read" on public.audit_logs for select to authenticated using (
  public.is_staff(auth.uid()) or (company_id is not null and public.is_company_member(auth.uid(), company_id)));

-- seed skills
insert into public.skills(name, category) values
 ('Reposição','Varejo'),('Merchandising','Varejo'),('Inventário','Varejo'),('Pesquisa de preço','Varejo'),
 ('Auditoria de loja','Varejo'),('Degustação','Promoção'),('Promoção de vendas','Promoção'),('Atendimento ao cliente','Geral'),
 ('Precificação','Varejo'),('Abastecimento','Varejo'),('Organização de loja','Varejo'),('Eventos','Promoção'),
 ('Liderança de equipe','Gestão'),('Excel','Ferramentas'),('Direção (CNH B)','Mobilidade');
