-- ============================================================
-- VIAURA - Supabase Database Schema
-- Ise Supabase Dashboard -> SQL Editor mein paste karke "Run" karein
-- ============================================================

create extension if not exists pgcrypto;

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  group_name text not null check (group_name in ('men','women','kids')),
  image text default '',
  description text default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  images text[] not null default '{}',
  category_id uuid references categories(id) on delete set null,
  group_name text not null check (group_name in ('men','women','kids')),
  price numeric not null,
  discount_price numeric default 0,
  sizes text[] default '{}',
  colors text[] default '{}',
  stock int not null default 0,
  ratings_average numeric default 0,
  num_reviews int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now()
);

-- Orders (guest checkout - shipping_address aur order_items JSON mein store hote hain)
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_items jsonb not null default '[]',
  shipping_address jsonb not null,
  payment_method text default 'COD',
  items_price numeric not null default 0,
  delivery_charge numeric not null default 250,
  total_price numeric not null default 0,
  status text not null default 'pending',
  status_history jsonb not null default '[]',
  is_repeat_customer_order boolean default false,
  created_at timestamptz default now()
);
create index orders_phone_idx on orders ((shipping_address->>'phone'));

-- Admin accounts (sirf admin, customers ke liye koi account nahi)
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

-- ============================================================
-- Storage: product/category images ke liye
-- ============================================================
-- Ye SQL Editor se nahi banega - alag se karna hoga:
-- 1. Left sidebar mein "Storage" par click karein
-- 2. "New bucket" dabayein
-- 3. Name: uploads
-- 4. "Public bucket" ON kar dein
-- 5. Create karein
-- ============================================================
