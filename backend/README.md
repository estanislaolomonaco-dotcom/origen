# MusicTrack — Backend

Schema y seed de la base de datos en **Supabase** (PostgreSQL gestionado).

## Estructura

```
backend/
└── supabase/
    ├── migrations/
    │   └── 001_init.sql   # 4 tablas + índices + RLS + policies
    └── seed.sql           # 12 instrumentos del catálogo
```

## Tablas

| Tabla | Descripción |
|---|---|
| `profiles` | Datos extra del usuario (vinculados a `auth.users` de Supabase). Preparada para autenticación. |
| `products` | Catálogo de instrumentos (12 filas iniciales). |
| `orders` | Órdenes de compra con `order_code` (`MT-XXXXXX`), datos del comprador, `total` y `status` (`pending`/`approved`/`failed`). |
| `order_items` | Items de cada orden con snapshot de precio y nombre. |

## Row Level Security (RLS)

| Tabla | Policies |
|---|---|
| `products` | `SELECT` público |
| `profiles` | Solo el dueño puede leer/editar lo suyo |
| `orders` / `order_items` | `INSERT` público (guest checkout); `SELECT` solo el dueño cuando haya auth |

## Setup paso a paso

### 1. Crear el proyecto en Supabase

1. Entrar a [supabase.com](https://supabase.com) y crear cuenta.
2. New project → elegir nombre (`musictrack`), región (Sudamérica), generar password de la base.
3. Esperar 1-2 min a que el proyecto esté ready.

### 2. Ejecutar la migración

1. En el panel del proyecto: **SQL Editor** → **New query**.
2. Pegar el contenido de [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. Click en **Run**. Debe mostrar `Success. No rows returned`.

### 3. Ejecutar el seed

1. Mismo SQL Editor → **New query**.
2. Pegar [`supabase/seed.sql`](supabase/seed.sql).
3. **Run**. Verificar con: `select count(*) from products;` → 12.

### 4. Conectar el frontend

En el panel de Supabase: **Project Settings → API**. Copiar:
- `Project URL`
- `anon public` key

Y pegarlas en `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Próximos pasos (módulos siguientes de la materia)

- **S11 · Auth**: integrar Supabase Auth para login/register, completar `profiles` automáticamente con un trigger.
- **S12 · Admin panel**: rutas server-only para listar/editar productos y ver órdenes (RLS bypass con `SUPABASE_SERVICE_ROLE_KEY`).
- **S13–S15 · Mercado Pago**: webhook que actualiza `orders.status` cuando MP confirma el pago.

## Comandos útiles

Si tenés `psql` instalado y la `DATABASE_URL` de Supabase a mano, podés aplicar todo desde la terminal:

```bash
cd backend
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxxx.supabase.co:5432/postgres" \
  npm run db:apply:psql
```

(Más cómodo es usar el SQL Editor del dashboard.)
