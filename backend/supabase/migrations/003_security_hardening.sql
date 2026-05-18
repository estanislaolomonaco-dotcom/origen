-- ============================================================
-- MusicTrack — Hardening de Row Level Security
--
-- Asegura que:
--  - Cada usuario solo puede leer / modificar SUS datos (perfil, orders, items).
--  - Nadie puede tocar datos de otro usuario, ni siquiera leyendo.
--  - El único admin es estani.lomonaco@gmail.com (panel /admin).
--  - El admin puede leer toda la tabla de orders / order_items / profiles
--    para el dashboard, pero no puede impersonar a un usuario.
--
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

-- ---------- Helper: is_admin() ----------
-- SECURITY DEFINER para evitar recursión con las policies de profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Asegurar columnas en profiles ----------
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  add column if not exists name text;

alter table public.profiles
  add column if not exists email text;

-- Forzar admin sobre el email correcto (idempotente).
update public.profiles p
   set role = 'admin'
  from auth.users u
 where u.id = p.id
   and u.email = 'estani.lomonaco@gmail.com'
   and p.role <> 'admin';

-- Cualquier otra cuenta debe quedar como 'user' (defensa en profundidad).
update public.profiles p
   set role = 'user'
  from auth.users u
 where u.id = p.id
   and u.email <> 'estani.lomonaco@gmail.com'
   and p.role = 'admin';

-- ---------- RLS ON ----------
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ============================================================
-- PROFILES
-- Solo el dueño puede leer / actualizar su perfil.
-- El admin puede leer todos (no actualizar, para no impersonar).
-- Nadie puede cambiar su propio 'role' (se valida en el WITH CHECK).
-- ============================================================
drop policy if exists "profiles_select_own"        on public.profiles;
drop policy if exists "profiles_select_admin"      on public.profiles;
drop policy if exists "profiles_update_own"        on public.profiles;
drop policy if exists "profiles_insert_self"       on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own name"  on public.profiles;
drop policy if exists "Admin can read all profiles" on public.profiles;
drop policy if exists "Service role full access"   on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Bloquea que un usuario se auto-promueva a admin.
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- PRODUCTS
-- Lectura pública. Solo admin escribe.
-- ============================================================
drop policy if exists "products_select_public"        on public.products;
drop policy if exists "products_admin_insert"         on public.products;
drop policy if exists "products_admin_update"         on public.products;
drop policy if exists "products_admin_delete"         on public.products;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Admin can read all products"     on public.products;
drop policy if exists "Admin can insert products"       on public.products;
drop policy if exists "Admin can update products"       on public.products;
drop policy if exists "Admin can delete products"       on public.products;

create policy "products_select_public"
  on public.products for select
  using (true);

create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());

-- ============================================================
-- ORDERS
-- INSERT público (guest checkout vía backend con service_role igual pasa).
--   Si viene un user_id, debe ser el del que inserta.
-- SELECT: dueño o admin.
-- UPDATE / DELETE: solo admin (los usuarios NO pueden modificar pedidos).
-- ============================================================
drop policy if exists "orders_insert_public" on public.orders;
drop policy if exists "orders_insert_guest_or_self" on public.orders;
drop policy if exists "orders_select_own"    on public.orders;
drop policy if exists "orders_select_admin"  on public.orders;
drop policy if exists "orders_update_admin"  on public.orders;
drop policy if exists "orders_delete_admin"  on public.orders;

create policy "orders_insert_guest_or_self"
  on public.orders for insert
  with check (
    user_id is null
    or user_id = auth.uid()
  );

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_delete_admin"
  on public.orders for delete
  using (public.is_admin());

-- ============================================================
-- ORDER_ITEMS
-- Mismas reglas que orders, vía join.
-- ============================================================
drop policy if exists "order_items_insert_public"     on public.order_items;
drop policy if exists "order_items_insert_via_order"  on public.order_items;
drop policy if exists "order_items_select_via_order"  on public.order_items;
drop policy if exists "order_items_select_admin"      on public.order_items;
drop policy if exists "order_items_update_admin"      on public.order_items;
drop policy if exists "order_items_delete_admin"      on public.order_items;

create policy "order_items_insert_via_order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id is null or o.user_id = auth.uid())
    )
  );

create policy "order_items_select_via_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items_select_admin"
  on public.order_items for select
  using (public.is_admin());

create policy "order_items_update_admin"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_delete_admin"
  on public.order_items for delete
  using (public.is_admin());

-- ============================================================
-- TRIGGER: handle_new_user
-- Sólo estani.lomonaco@gmail.com se crea con role='admin'.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Asegurar columna name (la usa el frontend) por si no existe todavía.
  -- Nota: este ALTER vive en la migración, no dentro del trigger.
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    case
      when new.email = 'estani.lomonaco@gmail.com' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- DONE
-- Verificar:
--   select email, role from public.profiles
--     join auth.users using (id);
-- ============================================================
