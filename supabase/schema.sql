create schema if not exists guesthouse;

-- Reconstructed from lib/db/enquiries.ts usage — this table already exists in production; this DDL is documentation, not something to execute against the live DB (it already exists there).
-- create table guesthouse.enquiries (
--   id uuid primary key default gen_random_uuid(),
--   name text not null,
--   phone text not null,
--   email text not null,
--   check_in date not null,
--   check_out date not null,
--   adults integer not null,
--   children integer not null,
--   message text,
--   locale text not null,
--   status text not null default 'new' check (status in ('new', 'confirmed', 'declined')),
--   token_hash text not null unique,
--   token_expires_at timestamptz not null,
--   token_used_at timestamptz,
--   email_sent boolean not null default false,
--   email_error text,
--   created_at timestamptz not null default now(),
--   ip_hash text
-- );

create table guesthouse.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('waiter', 'kitchen')),
  created_at timestamptz not null default now()
);

create table guesthouse.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references guesthouse.users(id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table guesthouse.rooms (
  id smallint primary key,
  label text not null,
  active boolean not null default true
);

create table guesthouse.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint menu_items_name_key unique,
  description text,
  price numeric(10,2) not null,
  category text not null check (category in ('bar', 'kitchen')),
  subcategory text not null,
  subcategory_order integer not null default 0,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table guesthouse.tabs (
  id uuid primary key default gen_random_uuid(),
  room_id smallint references guesthouse.rooms(id),
  label text,
  status text not null check (status in ('open', 'paid')) default 'open',
  opened_at timestamptz not null default now(),
  opened_by uuid not null references guesthouse.users(id),
  closed_at timestamptz,
  closed_by uuid references guesthouse.users(id),
  closed_total numeric(10,2)
);

alter table guesthouse.tabs
  add constraint tabs_room_or_label
  check (room_id is not null or label is not null);

-- NULL room IDs remain distinct, so this limits real rooms to one open tab without limiting guest tabs.
create unique index tabs_one_open_per_room
  on guesthouse.tabs (room_id)
  where status = 'open';

create table guesthouse.tab_items (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references guesthouse.tabs(id),
  menu_item_id uuid not null references guesthouse.menu_items(id),
  item_name text not null,
  item_price numeric(10,2) not null,
  quantity integer not null default 1,
  added_by uuid not null references guesthouse.users(id),
  added_at timestamptz not null default now(),
  status text not null check (status in ('added', 'sent_to_kitchen', 'ready', 'cancelled')) default 'added',
  ready_at timestamptz,
  cancelled_by uuid references guesthouse.users(id),
  cancelled_at timestamptz
);

create index tab_items_tab_id_idx on guesthouse.tab_items (tab_id);

-- Seed data: the six physical guest rooms.
insert into guesthouse.rooms (id, label, active)
values
  (21, 'Стая 21', true),
  (22, 'Стая 22', true),
  (23, 'Стая 23', true),
  (31, 'Стая 31', true),
  (32, 'Стая 32', true),
  (33, 'Стая 33', true)
on conflict (id) do update
set label = excluded.label, active = excluded.active;
