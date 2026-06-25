-- MedLive Healthcare — run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique,
  phone text,
  password_hash text,
  is_guest boolean not null default false,
  gstin text,
  saved_addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);

create table if not exists orders (
  id text primary key,
  order_number text not null unique,
  user_id text references users(id) on delete set null,
  guest_phone text,
  guest_email text,
  guest_name text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null,
  promo_code text,
  promo_discount numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  cgst numeric(12, 2) not null default 0,
  sgst numeric(12, 2) not null default 0,
  igst numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  payment_method text not null,
  payment_status text not null,
  payment_id text,
  razorpay_order_id text,
  status text not null,
  shipping_address jsonb not null,
  gstin text,
  invoice_number text,
  pincode text not null,
  shipment jsonb,
  return_request jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_created_at_idx on orders(created_at desc);

create table if not exists checkout_tokens (
  token text primary key,
  user_id text references users(id) on delete set null,
  guest_phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null,
  promo_code text,
  promo_discount numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  cgst numeric(12, 2) not null default 0,
  sgst numeric(12, 2) not null default 0,
  igst numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  gstin text,
  shipping_state text not null,
  expires_at timestamptz not null
);

create table if not exists otp_codes (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null
);

create table if not exists password_reset_tokens (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  email text not null,
  expires_at timestamptz not null
);

create table if not exists app_counters (
  id int primary key default 1,
  invoice_counter int not null default 1000,
  order_counter int not null default 10000,
  constraint single_row check (id = 1)
);

insert into app_counters (id, invoice_counter, order_counter)
values (1, 1000, 10000)
on conflict (id) do nothing;
