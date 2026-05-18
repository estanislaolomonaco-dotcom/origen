-- ============================================================
-- MusicTrack — Migración 002: Mercado Pago
-- Agrega columnas a orders para guardar el estado del pago.
-- ============================================================

-- Permitimos más estados además de los originales (pending/approved/failed).
-- MP devuelve: approved | pending | in_process | rejected | refunded | cancelled | charged_back
-- Mantenemos compatibilidad: dropeamos el check viejo y lo reemplazamos.
alter table public.orders
    drop constraint if exists orders_status_check;

alter table public.orders
    add constraint orders_status_check
    check (status in (
        'pending',
        'approved',
        'failed',
        'rejected',
        'in_process',
        'refunded',
        'cancelled',
        'charged_back'
    ));

-- Proveedor de pago: 'mercadopago' por ahora; queda abierto para sumar otros.
alter table public.orders
    add column if not exists payment_provider text;

-- ID del pago en el proveedor (ej. payment.id de MP).
-- UNIQUE para garantizar idempotencia en el webhook.
alter table public.orders
    add column if not exists payment_id text;

create unique index if not exists idx_orders_payment_id_unique
    on public.orders(payment_id)
    where payment_id is not null;

-- Estado normalizado del pago (separado de status interno por si divergen).
alter table public.orders
    add column if not exists payment_status text;

-- Respuesta cruda del proveedor (auditoría / debugging).
alter table public.orders
    add column if not exists payment_raw_response jsonb;

-- Preference ID de MP (devuelta al crear la preferencia).
alter table public.orders
    add column if not exists payment_preference_id text;

create index if not exists idx_orders_preference_id
    on public.orders(payment_preference_id);
