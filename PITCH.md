# Pitch — Parcial Oral 71.38 (10 minutos)

> Guion para acompañar las slides de `presentacion/index.html`. Cada bloque indica **slide**, **tiempo objetivo** y el **texto literal** que conviene decir, con tono natural. Al final hay tips de transición y posibles preguntas del profe.

**Tiempo total objetivo:** 10:00 · **Margen real:** apuntar a 9:00 para tener buffer.

**Distribución de las 7 slides:**

| Slide | Tema | Tiempo |
|---|---|---|
| 1 | Portada | 0:00 → 1:00 |
| 2 | Diagrama de arquitectura | 1:00 → 3:00 |
| 3 | HTML / CSS / JS | 3:00 → 5:00 |
| 4 | React + Next.js | 5:00 → 7:30 |
| 5 | Recorrido por la app (screenshots) | 7:30 → 8:30 |
| 6 | CI/CD | 8:30 → 9:00 |
| 7 | Uso fundamentado de IA | 9:00 → 10:00 |

---

## ⏱ Slide 1 — Portada (≈ 1 min · 0:00 → 1:00)

> **Buenos días / tardes. Soy Estanislao Lomonaco y vengo a presentar Origen, un e-commerce de instrumentos musicales que armé como proyecto integrador para esta materia.**
>
> En una frase: **Origen permite a un usuario explorar un catálogo de instrumentos — guitarras eléctricas, acústicas, bajos y accesorios —, filtrarlos por categoría, buscarlos por nombre, agregarlos a un carrito que se persiste en el navegador, y completar un checkout simulado con validación de formulario y confirmación de orden.** El tagline es *"Donde nace tu sonido"*.
>
> El stack es **Next.js 14 con App Router, JavaScript puro — sin TypeScript —, React 18 para los componentes interactivos, CSS Modules para los estilos, React Context con localStorage para el estado global del carrito, y deploy automático en Vercel a partir de un repositorio en GitHub.**
>
> Quiero ser claro desde el principio con el alcance: **el proyecto cubre frontend completo. La capa de datos hoy son 12 instrumentos mockeados en `src/data/products.js`. El backend con Supabase, la autenticación y la pasarela de pagos son la próxima iteración** — preferí entregar un frontend sólido y deployable antes que medio backend a medias.
>
> **Vamos al diagrama.**

**Tip de transición:** señalá la tabla de stack al decir cada tecnología, y al pasar a la slide 2 decí *"vamos al diagrama"* — funciona como gancho.

---

## ⏱ Slide 2 — Diagrama de arquitectura (≈ 2 min · 1:00 → 3:00)

> **Esta es la slide más importante porque resume cómo se conectan todas las piezas del proyecto.**
>
> Arriba a la izquierda están **el usuario y el navegador** — es el punto de entrada. Cuando el usuario entra al sitio, el navegador pide a Vercel los assets de la app de Next.js.
>
> El frontend está organizado en tres capas que diferencié con colores en el diagrama:
>
> **En azul, la estructura — HTML semántico:** el `layout.js` raíz envuelve toda la app con `<html>`, `<body>` y `<main>`, y dentro viven las páginas, que son las cinco rutas reales del repo: la home, `/productos`, `/productos/[id]` que es dinámica, `/carrito` y `/checkout`.
>
> **En amarillo, los estilos — CSS:** tengo un `globals.css` con variables CSS en `:root` que definen la paleta y un puñado de clases utilitarias, y después cada componente tiene su propio CSS Module con scope local — así no hay colisiones entre estilos.
>
> **En verde, la lógica — React y JavaScript:** los componentes reutilizables (`Navbar`, `ProductCard`, `ProductGrid`, `ProductFilters`, `CartItem`, `Footer`), el `CartContext` que es el estado global, y `localStorage` que es donde persiste el carrito.
>
> **El flujo de información, siguiendo las flechas:** una página renderiza componentes, los componentes consumen el contexto vía `useCart()`, y el contexto sincroniza con localStorage en ambas direcciones.
>
> **La flecha punteada de Context hacia Components es clave:** representa que cuando llamo a `setState` dentro del contexto, React re-renderiza automáticamente todos los componentes que están suscritos. Cuando agrego un producto, el badge del navbar y los totales del carrito se actualizan en el mismo ciclo.
>
> **Y abajo, en violeta, está el pipeline de deploy:** código local → `git push` a GitHub → un webhook le avisa a Vercel → Vercel corre `npm run build` → si el build pasa, queda online en una URL `*.vercel.app` — en mi caso, las 12 páginas de instrumentos se prerenderizan estáticamente. Esa URL es la que sirve los assets al navegador del usuario.
>
> **Con esto tengo cubiertos los seis elementos que pide el diagrama: usuario y navegador, separación HTML/CSS/JS, componentes y rutas reales del repo, flechas de flujo, re-render por state, y pipeline de deploy de punta a punta.**

**Tip de transición:** este es el momento de no apurarse. Si el profe pregunta algo del diagrama, respondé acá. Después: *"Voy a abrir cada capa con ejemplos del código real."*

---

## ⏱ Slide 3 — Fundamentos HTML / CSS / JS (≈ 2 min · 3:00 → 5:00)

> **Acá bajo cada concepto del módulo 2 a un archivo concreto del repo, así podemos verificarlo en vivo si querés.**
>
> **HTML semántico:** uso `<header>` y `<nav>` en el Navbar, `<main>` en el layout raíz, `<article>` por cada producto en `ProductCard`, `<section>` para separar las áreas del home, y `<footer>` con jerarquía de `h3` y `h4`. Nada de divs sueltos donde podía usar un tag con significado.
>
> **Accesibilidad:** los botones sin texto visible llevan `aria-label` — el botón hamburguesa, el botón de agregar al carrito, los `+` y `–` de cantidad. El menú móvil usa `aria-expanded` para que un lector de pantalla sepa si está abierto. El breadcrumb del detalle tiene `aria-label="Breadcrumb"`. Y todos los inputs del checkout tienen `<label htmlFor>` asociado.
>
> **Responsive:** uso CSS Grid para la grilla del catálogo, que va de cuatro a tres a dos a una columna según el ancho. El layout del carrito es de dos columnas en desktop y colapsa a una sola debajo de 900 píxeles. Flexbox lo uso para el navbar y las barras de acciones. Las variables CSS en `:root` me permiten cambiar toda la paleta editando un solo lugar.
>
> **Eventos en JS:** `onClick` para agregar al carrito en `ProductCard`, `onClick` en los `+` y `–` de `CartItem`, `onSubmit` con `preventDefault` en el checkout, y `onChange` en el buscador y los selects de filtros.
>
> **Validación de formularios:** está implementada manualmente en `checkout/page.js`. Valido nombre obligatorio, email con regex, teléfono con al menos seis dígitos numéricos, y dirección obligatoria. Los errores se guardan en `useState` y se muestran debajo de cada campo.
>
> **Acá quiero ser honesto con un punto:** **la asincronía con `fetch` y `async/await` no la usé porque no hay backend todavía**. Los productos se importan estáticamente desde el archivo de mock. Cuando se sume Supabase, el reemplazo natural es un `useEffect` con `fetch` o, mejor, un Server Component que haga la query en build time.
>
> **Los módulos ES6** los uso en toda la app: cada archivo exporta lo que necesita y se importa con el alias `@/*` configurado en `jsconfig.json`. Cada archivo tiene una sola responsabilidad: `lib/format.js` solo formatea precios, `context/` solo maneja estado, `components/` solo presenta UI.

**Tip:** si el profe pide ver un ejemplo, abrí `Navbar.js` o `checkout/page.js` — son los más visuales para defender ARIA y validación.

---

## ⏱ Slide 4 — React + Next.js (≈ 2:30 min · 5:00 → 7:30)

> **Esta es la parte más densa. Voy a ir por cuatro conceptos: props vs state, useEffect, re-render y server vs client components.**
>
> **Props vs state.** Un componente recibe **props** desde afuera y son inmutables — por ejemplo, `<ProductCard product={p} />` en `ProductGrid`: el grid le pasa el producto como prop, el card no lo modifica. **State** es interno y mutable — por ejemplo, en `AddToCartButton` tengo un `useState` para la cantidad seleccionada antes de agregar al carrito. Otros estados del proyecto: el array `items` dentro del Context, el booleano `open` que abre y cierra el menú móvil, el objeto `form` con los datos del checkout y el objeto `errors` con los mensajes de validación.
>
> **`useEffect`.** Acá el ejemplo es muy concreto: en el `CartContext` tengo **dos efectos con responsabilidades distintas**.
>
> El primero **corre una sola vez al montar** — su array de dependencias está vacío. Lo que hace es leer el localStorage y popular el estado del carrito. Esto es lo que permite que recargues la página y tu carrito siga ahí.
>
> El segundo **corre cada vez que cambia `items`**: su array de dependencias es `[items, hydrated]`. Lo que hace es escribir el estado en localStorage. Pero atención: tiene un guard `if (!hydrated) return` al principio. **Eso es para evitar un bug muy específico**: durante el primer render, antes de que el primer efecto haya leído localStorage, `items` es un array vacío. Sin el guard, el segundo efecto se dispararía con ese array vacío y **pisaría lo que estaba guardado**. Por eso uso el flag `hydrated` que se prende solo cuando ya leí.
>
> **Re-render.** ¿Cuándo y por qué se re-renderiza la app? Caso típico: hago click en "Agregar" dentro de un `ProductCard`. Eso llama a `addItem(product)` del Context, que ejecuta `setItems(...)`. React detecta que el estado cambió y re-renderiza **todos los componentes que están suscritos a `useCart()`**: el badge del navbar muestra un número más, los totales del carrito se recalculan, y el `useEffect` con dependencia `[items]` se dispara y guarda en localStorage. Todo en un solo ciclo de render.
>
> **Rutas en Next App Router.** El App Router mapea **carpetas a URLs**: `app/page.js` es la home, `app/productos/page.js` es el catálogo, `app/productos/[id]/page.js` es el detalle dinámico. Y acá hay algo que vale la pena destacar: tengo `generateStaticParams()` en el detalle, que **pre-renderiza estáticamente las doce páginas de instrumentos en build time** — una HTML por cada producto del catálogo. Si corremos `npm run build` ahora, las vas a ver listadas como SSG.
>
> **Server vs Client Components.** Por defecto, Next renderiza todo en el servidor. Un componente es Client solo si arriba del archivo lleva `"use client"`. **Esta decisión la tomé caso por caso:** las páginas que solo muestran datos son Server Components — más rápidas, menos JS al cliente. Los componentes que necesitan estado, hooks o eventos son Client. Por ejemplo, la página `/productos/[id]` es Server Component que se prerenderiza, pero el botón de agregar está aislado como Client en `AddToCartButton.js` — así la página queda estática y solo el botón hidrata. Mismo principio con la página de productos: la envuelvo en `<Suspense>` y la lógica de filtros vive en un Client Component aparte llamado `ProductsView`.

**Tip:** este es el slide donde más fácil te interrumpen. Si te preguntan algo en el medio, respondé y volvé al hilo. No te apures pasando.

---

## ⏱ Slide 5 — Recorrido por la app (≈ 1 min · 7:30 → 8:30)

> **Antes de pasar al deploy, quiero mostrar el producto funcionando — porque la mejor demostración es verlo en vivo.**
>
> Acá tienen capturas del recorrido completo del usuario:
>
> - **Home** — hero, instrumentos destacados, categorías y los cuatro beneficios.
> - **Catálogo** — la grilla responsive con el buscador, el filtro por categoría y el ordenamiento por precio. Si tipeo "Strato" me filtra al instante porque es estado local de React, no recarga la página.
> - **Detalle** — cada uno de los doce instrumentos tiene su URL propia, prerenderizada estáticamente en build time. La sección "Productos relacionados" usa el helper `getRelatedProducts()` que filtra por misma categoría.
> - **Carrito** — con productos cargados, el resumen actualiza en tiempo real, y si recargás la página los items siguen ahí gracias a `localStorage`.
>
> **Si tienen acceso al deploy, pueden probar todo el flujo en vivo, incluyendo el checkout que valida el formulario y emite un número de orden.**

**Tip:** si tenés la URL de Vercel, abrila en el navegador antes del oral y mostrala como demo después de esta slide. Esa es la "evidencia viva" que cierra mejor que cualquier captura.

> **Vamos al pipeline de deploy.**

---

## ⏱ Slide 6 — CI/CD (≈ 1 min · 8:30 → 9:00)

> **El pipeline va de punta a punta así: trabajo local, commit, push a GitHub, GitHub dispara un webhook a Vercel, Vercel buildea, y si pasa queda en una URL pública.**
>
> En **local** corro `npm run dev` para desarrollar, y antes de pushear corro `npm run lint` y `npm run build` para no subir nada roto.
>
> El **repositorio** es uno solo, en GitHub, branch `main`.
>
> **Vercel** está conectado al repo: detecta automáticamente que es Next.js, no necesita configuración. Cuando hago push a main, ejecuta `npm install` y `npm run build`. **Si el build falla, el deploy se rechaza y la URL anterior queda intacta** — eso es importante porque garantiza que producción nunca tiene código que no compila.
>
> Una feature útil de Vercel son los **preview deploys**: cada Pull Request genera una URL temporal para revisar cambios antes de mergear.
>
> **Variables de entorno: hoy no tengo, porque no hay backend.** Cuando se sume Supabase, las claves se configuran desde el panel de Vercel — `Settings → Environment Variables` — y nunca se commitean. El `.gitignore` ya cubre `.env.local`, `node_modules/`, `.next/` y `.vercel/`.
>
> **Verificación en vivo:** si querés, podemos correr `npm run build` ahora — compila las diecinueve páginas, doce de ellas estáticas vía SSG, sin warnings ni errores de lint.

---

## ⏱ Slide 7 — Uso fundamentado de IA (≈ 1 min · 9:00 → 10:00)

> **Última slide y la del módulo 4. Adjunto el archivo `PROMPTS.md` con los prompts representativos agrupados por feature, así podés ver el detalle.**
>
> **Herramienta:** usé Claude Code, que es un CLI agentic integrado a VS Code. La diferencia con un chat web es que **lee y escribe archivos directamente en el repo, ejecuta comandos como `npm run build` para validar, y mantiene contexto multi-archivo**. Eso me permitió trabajar a nivel de feature, no de snippet aislado.
>
> **Cómo validé lo que generaba:**
>
> Primero, **lectura previa** — ningún archivo lo acepté sin leerlo entero, sobre todo en partes críticas como el `CartContext`.
>
> Segundo, **build después de cada feature** — y acá pasó algo concreto que vale la pena contar: **la IA me sugirió usar `useSearchParams` directamente en la página del catálogo, y el `npm run build` me lo rechazó**. El error decía que en App Router `useSearchParams` necesita un Suspense boundary para el prerender estático. **Entendí por qué — durante el build no hay query string, así que React tiene que poder suspender hasta que el cliente hidrate — y refactoricé separando la lógica en `ProductsView` envuelto en `<Suspense>`**. Ese código está hoy en el repo.
>
> Tercero, **test manual de cada flujo** — agregar, quitar, recargar, vaciar, checkout, recargar después del checkout vacío.
>
> Cuarto, **cortar sugerencias fuera de scope** — la IA tendía a sugerir Tailwind o librerías de UI. Las corté porque la consigna pedía CSS Modules.
>
> **Otros bugs reales que detectó:** el badge del carrito parpadeaba en cero al recargar — era un mismatch de hidratación entre SSR y cliente, lo arreglé con el flag `hydrated`. Y `generateStaticParams` me fallaba porque le pasaba IDs numéricos cuando Next exige strings.
>
> **Lo importante:** las decisiones de arquitectura las tomé yo — usar Context y no Redux, mock data en vez de fetch para este alcance, qué archivos llevan `"use client"`. **La IA generó mucho boilerplate y aceleró el desarrollo, pero los efectos críticos los verifiqué línea por línea — por eso si me preguntás por qué el `CartContext` tiene dos `useEffect` y no uno solo, te lo puedo defender.**
>
> **Y con eso cierro. Gracias.**

---

## 🎯 Tips finales

### Tono y ritmo
- **Hablá con naturalidad, no leas.** El guion es para llegar preparado, no para recitarlo.
- **Pausá medio segundo entre slides** mientras cambia. Da tiempo al profe a leer el header.
- **Si te trabás, no pidas perdón** — respirá, mirá la slide, retomá. No metas "este, mmm".
- Si llegás a 9 minutos en la slide 6, **apurá la última tercera parte** ("y para cerrar, las decisiones de arquitectura las tomé yo, la IA aceleró el boilerplate, gracias").

### Posibles preguntas del profe (preparadas)

| Pregunta probable | Respuesta corta |
|---|---|
| *"Mostrame dónde está el `useEffect`"* | Abrir `src/context/CartContext.js`, líneas 14-30. Explicar las deps. |
| *"¿Por qué Context y no Redux?"* | "Para el alcance del proyecto, un solo dominio (carrito) y pocas operaciones, Redux era overkill. Context + `useState` cubre el caso sin agregar dependencias." |
| *"¿Qué pasa si el usuario tiene localStorage deshabilitado?"* | "El `try/catch` en el primer `useEffect` lo cubre — arranca con carrito vacío y la app sigue funcionando, solo no persiste entre sesiones." |
| *"¿Por qué no usás Image de Next?"* | "Decisión de simplicidad: `<img>` plano evita configurar `remotePatterns` y mantiene la consigna acotada. En producción real lo migraría a `<Image>`." |
| *"¿Cómo agregarías Supabase?"* | "Crear tabla `products` en Supabase, reemplazar el import estático en las páginas por una query desde un Server Component (que corre en el servidor y no expone la key), y configurar `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_ANON_KEY` en Vercel." |
| *"¿Qué es SSG vs SSR vs CSR?"* | "SSG = HTML pre-generado en build time, lo que hace `generateStaticParams` para mis 12 productos. SSR = renderizado en cada request en el servidor. CSR = se renderiza en el navegador, después de descargar el JS. Mis páginas son SSG y los componentes con `'use client'` hidratan sobre eso." |
| *"¿Por qué dos `useEffect` y no uno?"* | "Tienen disparadores distintos: uno corre al montar (deps `[]`) para leer; el otro corre cuando cambia `items` (deps `[items]`) para escribir. Si los unía, o leía en cada cambio o escribía sin haber leído todavía." |
| *"¿Cuál fue el error más difícil que detectó la IA?"* | "El de `useSearchParams` sin `Suspense` — porque el error de build era confuso pero la solución obligaba a entender el modelo de prerender de Next. La separé en `ProductsView` envuelto en `<Suspense>`." |
| *"¿Por qué instrumentos musicales?"* | "Quería que se sienta una tienda real y no un demo genérico. Además me sirvió como prueba de extensibilidad: durante el desarrollo cambié el rubro dos veces — primero genérico, después café, finalmente instrumentos — y cada rebrand fue un solo commit porque la paleta vive en variables CSS y el catálogo en un único archivo. Lo podés ver en el git log." |
| *"¿Qué hay que cambiar para vender otra cosa?"* | "Tres archivos: `src/data/products.js` para el catálogo, las 4 variables CSS en `:root` de `globals.css` para la paleta, y los textos del hero / footer / metadata. La arquitectura no cambia." |

### Cosas que **NO** decir
- ❌ "La IA hizo todo" → vale 0 puntos del módulo 4.
- ❌ "Usé Supabase" si no lo implementaste → el profe abre el repo y se cae todo.
- ❌ "Tengo autenticación" → no.
- ❌ "El checkout cobra con Mercado Pago" → no.

### Cosas que **SÍ** podés enfatizar
- ✅ "Decisión consciente" cada vez que algo está marcado pendiente.
- ✅ "Verificable en el código" cada vez que mencionás algo concreto.
- ✅ "Lo entendí porque" cada vez que explicás un bug o una decisión.

---

## 🎬 Apertura y cierre — versión corta para memorizar

**Apertura (15 seg):**
> "Buenos días. Soy Estanislao Lomonaco. Vengo a presentar **Origen**, un e-commerce de **instrumentos musicales** — guitarras, bajos y accesorios — hecho con **Next.js 14, JavaScript, CSS Modules, deployado en Vercel desde GitHub**. Frontend completo con catálogo, carrito persistente y checkout. Backend pendiente como decisión consciente de alcance. Vamos al diagrama."

**Cierre (15 seg):**
> "Las decisiones de arquitectura las tomé yo — Context, mock data, qué corre en server vs cliente. La IA aceleró el boilerplate, pero los efectos críticos los verifiqué línea por línea. Adjunto `PROMPTS.md` con la documentación. Gracias."
