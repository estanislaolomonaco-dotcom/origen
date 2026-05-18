-- ============================================================
-- MusicTrack — Migración inicial
-- Crea las 4 tablas + índices + RLS + policies
-- Pegar en el SQL Editor de Supabase y ejecutar.
-- ============================================================

-- ---------- 1) PROFILES ----------
-- Datos extra de cada usuario, vinculados al sistema de auth de Supabase.
-- Por ahora la app funciona con guest checkout, pero la tabla queda lista
-- para cuando se sume autenticación (Módulo E · S11).
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    address text,
    created_at timestamptz not null default now()
);

-- ---------- 2) PRODUCTS ----------
create table if not exists public.products (
    id bigserial primary key,
    name text not null,
    price integer not null check (price >= 0),
    description text,
    category text not null,
    image text,
    stock integer not null default 0 check (stock >= 0),
    created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);

-- ---------- 3) ORDERS ----------
-- user_id es NULLABLE para permitir guest checkout.
-- order_code es el identificador human-readable (MT-XXXXXX).
-- status: pending | approved | failed (preparado para Mercado Pago en Módulo F).
create table if not exists public.orders (
    id bigserial primary key,
    order_code text not null unique,
    user_id uuid references public.profiles(id) on delete set null,
    customer_name text not null,
    customer_email text not null,
    customer_phone text,
    customer_address text,
    comments text,
    total integer not null check (total >= 0),
    status text not null default 'pending' check (status in ('pending', 'approved', 'failed')),
    created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ---------- 4) ORDER_ITEMS ----------
-- product_name y unit_price guardan SNAPSHOT para que la orden no cambie
-- si el producto se renombra o cambia de precio después.
create table if not exists public.order_items (
    id bigserial primary key,
    order_id bigint not null references public.orders(id) on delete cascade,
    product_id bigint references public.products(id) on delete set null,
    product_name text not null,
    unit_price integer not null check (unit_price >= 0),
    quantity integer not null check (quantity > 0),
    subtotal integer not null check (subtotal >= 0)
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ---------- POLICIES: products ----------
-- Lectura pública. Cualquier visitante puede ver el catálogo.
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
    on public.products for select
    using (true);

-- ---------- POLICIES: profiles ----------
-- Solo el dueño puede ver y editar su perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
    on public.profiles for insert
    with check (auth.uid() = id);

-- ---------- POLICIES: orders ----------
-- INSERT público (permite guest checkout sin auth).
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
    on public.orders for insert
    with check (true);

-- SELECT solo el dueño (cuando haya auth). Sin auth, anon no puede leer ordenes.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
    on public.orders for select
    using (auth.uid() = user_id);

-- ---------- POLICIES: order_items ----------
-- INSERT público (parte del flujo de checkout).
drop policy if exists "order_items_insert_public" on public.order_items;
create policy "order_items_insert_public"
    on public.order_items for insert
    with check (true);

-- SELECT del dueño de la orden.
drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_order"
    on public.order_items for select
    using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and o.user_id = auth.uid()
        )
    );

-- ============================================================
-- DONE
-- Verificar:
--   select count(*) from public.products;  -- debería ser 0
--   select count(*) from public.orders;    -- debería ser 0
-- Después correr seed.sql para insertar los 12 instrumentos.
-- ============================================================
