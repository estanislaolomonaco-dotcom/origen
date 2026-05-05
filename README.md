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

## Próximos pasos (módulos siguientes)

- **S11 · Auth**: Supabase Auth + completar `profiles` con trigger.
- **S12 · Admin panel**: rutas server-only para gestionar productos y órdenes.
- **S13–S15 · Mercado Pago**: checkout real + webhook que actualiza `orders.status`.

## Materiales del oral

- [presentacion/index.html](presentacion/index.html) — slides interactivas.
- [PITCH.md](PITCH.md) / [GUION.md](GUION.md) — guion del oral.
- [PROMPTS.md](PROMPTS.md) — anexo de prompts de IA.
- [EXPLICACION_SLIDES.md](EXPLICACION_SLIDES.md) — glosario.

## Licencia

Proyecto académico, sin fines comerciales.
