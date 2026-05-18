# MusicTrack — Monorepo

> **Donde nace tu sonido.**
>
> E-commerce de instrumentos musicales (guitarras eléctricas, acústicas, bajos y accesorios) — proyecto académico para la materia **71.38 Programación Web**.

## Estructura

```
.
├── frontend/        # Next.js 14 — UI pura. Hace fetch al backend.
│                    # Vercel deploy A.
├── backend/         # Next.js 14 — API REST + cliente Supabase.
│   └── supabase/    # Migraciones SQL + seed.
│                    # Vercel deploy B (otra URL).
├── presentacion/    # Slides HTML del oral
├── README.md
├── PRESENTACION.md  # Versión texto de las slides
├── PITCH.md         # Guion oral de 10 min
├── GUION.md         # Guion literal slide por slide
├── PROMPTS.md       # Documentación de prompts de IA (anexo módulo 4)
└── EXPLICACION_SLIDES.md  # Glosario detallado de cada término
```

## Arquitectura: dos servicios separados

```
┌──────────────────┐       fetch        ┌──────────────────┐       SQL       ┌──────────────┐
│  FRONTEND        │ ─────────────────▶ │  BACKEND         │ ──────────────▶ │  Supabase    │
│  Next.js · UI    │                    │  Next.js · API   │                 │  PostgreSQL  │
│                  │  /api/products     │                  │                 │              │
│  vercel deploy A │  /api/categories   │  vercel deploy B │                 │              │
└──────────────────┘  /api/products/:id └──────────────────┘                 └──────────────┘
                      /api/orders
```

| Servicio | Qué tiene | Env vars |
|---|---|---|
| **frontend/** | UI, componentes, carrito (localStorage), `lib/api.js` que hace fetch | `NEXT_PUBLIC_API_URL` (URL del backend) |
| **backend/** | Endpoints REST, capa de datos, conexión a Supabase, middleware | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

## Quick start

### En desarrollo: levantá los dos servicios en terminales separadas

```bash
# Terminal 1 — Backend (API)
cd backend
npm install
cp .env.example .env.local      # completar URL + PUBLISHABLE_KEY de Supabase
npm run dev                      # http://localhost:3001

# Terminal 2 — Frontend (UI)
cd frontend
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                      # http://localhost:3000
```

Si el backend no está corriendo (o no tiene Supabase configurado), el frontend cae al **mock local** de `frontend/src/data/products.js`. La app sigue funcionando, solo que no persiste órdenes.

### Setup de Supabase (una sola vez)

1. Crear proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → ejecutar [backend/supabase/migrations/001_init.sql](backend/supabase/migrations/001_init.sql) (4 tablas + RLS).
3. SQL Editor → ejecutar [backend/supabase/seed.sql](backend/supabase/seed.sql) (12 instrumentos).
4. Settings → API → copiar `Project URL` y `anon public key` (también llamada *publishable key*).
5. Pegar en `backend/.env.local`.

Detalle completo: [backend/README.md](backend/README.md).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 14** · App Router |
| Lenguaje | **JavaScript** ES6 modules |
| UI | React 18 · CSS Modules · HTML semántico |
| Estado global | React Context + `localStorage` |
| Backend | **Supabase** (PostgreSQL + RLS) |
| CI / Hosting | GitHub + **Vercel** |

## Funcionalidades

- Home con hero, instrumentos destacados, categorías, beneficios.
- Catálogo con búsqueda, filtro por categoría, ordenamiento.
- Detalle dinámico (`/productos/[id]`) **prerenderizado en build (SSG)**.
- Carrito persistido en `localStorage` bajo la key `musictrack_cart`.
- Checkout con validación → **POST a `/api/orders`** que inserta en Supabase.
- Order ID humano: `MT-XXXXXX`.

## Deploy en Vercel — DOS proyectos separados

### 1) Backend (API)

1. New project → mismo repo de GitHub.
2. **Root Directory:** `backend`.
3. **Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon public)
   - `ALLOWED_ORIGINS` (opcional) → la URL del frontend (`https://musictrack.vercel.app`)
4. Deploy. La URL queda algo como `https://musictrack-api.vercel.app`.

### 2) Frontend (UI)

1. New project → mismo repo.
2. **Root Directory:** `frontend`.
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` → la URL del backend deployado.
4. Deploy. La URL queda algo como `https://musictrack.vercel.app`.

Cada `git push` redeploya ambos automáticamente (o solo uno si Vercel detecta que solo cambió esa carpeta — depende del proyecto).

### Supabase

Supabase es totalmente gestionado: el "deploy" es ejecutar las migraciones y el seed desde el SQL Editor. No requiere infraestructura propia.

## Mercado Pago (Checkout Pro)

El checkout permite pagar con **Mercado Pago** además del flujo manual.
Se usa **Checkout Pro** (redirect a `init_point`) en vez de Bricks porque
el frontend usa CSS Modules sin dependencias de UI y el redirect deja
**cero** lógica de pago del lado cliente.

### 1) Migración de BD

```bash
# En SQL Editor de Supabase, correr:
backend/supabase/migrations/002_mercadopago.sql
```

Agrega: `payment_provider`, `payment_id` (UNIQUE para idempotencia),
`payment_status`, `payment_raw_response`, `payment_preference_id`.

### 2) Variables de entorno (backend)

En `backend/.env.local`:

```env
MP_ACCESS_TOKEN=TEST-xxxxx       # Sandbox: empieza con TEST-
MP_PUBLIC_KEY=TEST-xxxxx         # Sólo si en el futuro usamos Bricks
MP_WEBHOOK_SECRET=xxxxx          # Dashboard MP → Webhooks → Clave secreta
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:3001
```

> ⚠️ En dev local, MP necesita una URL pública para enviar webhooks.
> Usar [ngrok](https://ngrok.com/) o `cloudflared tunnel` apuntando al 3001
> y poner esa URL en `BACKEND_PUBLIC_URL`.

### 3) Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/payments/mercadopago/create-preference` | Valida items contra DB, crea orden + preference, devuelve `initPoint`. |
| `POST` | `/api/payments/mercadopago/webhook` | Valida firma `x-signature`, re-consulta el pago a MP y actualiza la orden (idempotente). |
| `GET` | `/api/orders/:orderCode` | Estado real de la orden (usado por las páginas de retorno). |

### 4) Flujo

1. Usuario completa el checkout y elige *Mercado Pago* → POST a `create-preference`.
2. Backend valida stock/precios, crea la orden `pending` y obtiene `initPoint`.
3. Frontend redirige a `initPoint` (Checkout Pro).
4. MP redirige al usuario a `/checkout/success|failure|pending`.
5. Esas páginas **no confían en query params** — consultan `/api/orders/:code`.
6. MP envía webhook en paralelo → backend re-consulta el pago y actualiza la orden.

### 5) Tarjetas de prueba (sandbox Argentina)

Usuario de prueba: ver [docs MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/test-integration).

| Resultado | Número | CVV | Vencimiento | Titular |
|---|---|---|---|---|
| **APRO** (aprobado) | `5031 7557 3453 0604` | `123` | `11/30` | `APRO` |
| **OTHE** (rechazado por error general) | igual | igual | igual | `OTHE` |
| **CONT** (pendiente) | igual | igual | igual | `CONT` |
| **CALL** (rechazado por autorización) | igual | igual | igual | `CALL` |
| **FUND** (sin fondos) | igual | igual | igual | `FUND` |

DNI: `12345678`. El nombre del titular **es** el switch del resultado.

### 6) Tests

```bash
cd backend
npm test          # smoke tests de firma + mapper de estados
```

El test de integración contra el sandbox de MP corre sólo si está
`MP_ACCESS_TOKEN` en el entorno.

## TODOs pendientes

- Decremento de stock en webhook tras `approved`.
- Email de confirmación al cliente.
- Mover efectos post-pago a una cola si crecen (BullMQ / Inngest / pg_cron).
- Opción de Bricks (checkout embebido) si se quiere evitar el redirect.

## Próximos pasos (módulos siguientes)

- **S11 · Auth**: Supabase Auth + completar `profiles` con trigger.
- **S12 · Admin panel**: rutas server-only para gestionar productos y órdenes.

## Materiales del oral

- [presentacion/index.html](presentacion/index.html) — slides interactivas.
- [PITCH.md](PITCH.md) / [GUION.md](GUION.md) — guion del oral.
- [PROMPTS.md](PROMPTS.md) — anexo de prompts de IA.
- [EXPLICACION_SLIDES.md](EXPLICACION_SLIDES.md) — glosario.

## Licencia

Proyecto académico, sin fines comerciales.
