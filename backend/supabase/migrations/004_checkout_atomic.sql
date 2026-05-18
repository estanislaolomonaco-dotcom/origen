-- ============================================================
-- MusicTrack — Checkout atómico
--
-- Una sola función Postgres hace TODO el flujo de compra en una
-- transacción, con FOR UPDATE para evitar oversold:
--
--   1) Valida que haya sesión (auth.uid() no null).
--   2) Valida que el carrito no esté vacío.
--   3) Valida datos del cliente.
--   4) Lockea las filas de products con FOR UPDATE.
--   5) Chequea stock de cada item.
--   6) Calcula el total con los precios REALES de la BD (no del cliente).
--   7) Inserta la orden con user_id = auth.uid().
--   8) Inserta los order_items con snapshot de precio.
--   9) Descuenta stock de cada producto.
--  10) Devuelve { order_code, order_id, total }.
--
-- Si cualquier paso falla, Postgres revierte TODO (sin órdenes huérfanas
-- ni stock descontado a medias).
-- ============================================================

-- Ensure stock column exists (defensive — ya viene de 001_init).
alter table public.products
  add column if not exists stock integer not null default 0 check (stock >= 0);

drop function if exists public.checkout(jsonb, jsonb);

create function public.checkout(
  p_items    jsonb,   -- [{ "id": 1, "quantity": 2 }, ...]
  p_customer jsonb    -- { name, email, phone, address, comments }
)
returns table (order_code text, order_id bigint, total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid    := auth.uid();
  v_total      integer := 0;
  v_order_id   bigint;
  v_order_code text;
  v_item       jsonb;
  v_product    public.products%rowtype;
  v_qty        integer;
begin
  -- 1) Autenticación obligatoria
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  -- 2) Carrito no vacío
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'CART_EMPTY' using errcode = '22023';
  end if;

  -- 3) Datos del cliente
  if p_customer is null
     or coalesce(p_customer->>'name','')    = ''
     or coalesce(p_customer->>'email','')   = ''
     or coalesce(p_customer->>'address','') = ''
  then
    raise exception 'CUSTOMER_INVALID' using errcode = '22023';
  end if;

  -- 4) Generar order_code (reintenta hasta 5 veces si choca)
  for i in 1..5 loop
    v_order_code := 'MT-' || lpad(floor(random() * 1000000)::text, 6, '0');
    exit when not exists (select 1 from public.orders where order_code = v_order_code);
  end loop;

  -- 5) Insertar orden con total = 0 (se actualiza al final)
  insert into public.orders (
    order_code, user_id,
    customer_name, customer_email, customer_phone, customer_address, comments,
    total, status
  ) values (
    v_order_code, v_user_id,
    p_customer->>'name', p_customer->>'email',
    p_customer->>'phone', p_customer->>'address', p_customer->>'comments',
    0, 'pending'
  ) returning id into v_order_id;

  -- 6) Por cada item: lock fila producto → valida stock → descuenta → inserta item
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := nullif(v_item->>'quantity','')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'QTY_INVALID' using errcode = '22023';
    end if;

    -- FOR UPDATE serializa: si otro checkout corre en paralelo sobre el mismo
    -- producto, espera a que termine antes de leer el stock.
    select * into v_product
    from public.products
    where id = nullif(v_item->>'id','')::bigint
    for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND:%', v_item->>'id' using errcode = '22023';
    end if;

    if v_product.stock < v_qty then
      raise exception 'STOCK_INSUFFICIENT:%', v_product.name using errcode = '22023';
    end if;

    update public.products
       set stock = stock - v_qty
     where id = v_product.id;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, subtotal
    ) values (
      v_order_id, v_product.id, v_product.name,
      v_product.price, v_qty, v_product.price * v_qty
    );

    v_total := v_total + (v_product.price * v_qty);
  end loop;

  -- 7) Actualizar total real de la orden
  update public.orders set total = v_total where id = v_order_id;

  return query select v_order_code, v_order_id, v_total;
end;
$$;

revoke all on function public.checkout(jsonb, jsonb) from public, anon;
grant execute on function public.checkout(jsonb, jsonb) to authenticated;
