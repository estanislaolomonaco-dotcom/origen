# Screenshots para la Slide 5

La slide "Recorrido por la app" busca **4 imágenes** en esta carpeta.
Si alguna no existe, la slide muestra un placeholder en su lugar (no rompe).

## Cómo capturarlas (Mac)

### 1. Levantá la app local

```bash
cd "/Users/estanislaolomonaco/eccomerce progra web 2.0"
npm run dev
```

Abrí http://localhost:3000 en el navegador.

### 2. Tomá las capturas

**Atajo:** `Cmd + Shift + 4` → arrastrás el área a capturar → se guarda en el Escritorio.

Sugerencia: capturá ventana completa con `Cmd + Shift + 4`, después `Espacio`, click en la ventana del navegador. Queda más prolijo.

### 3. Guardá los archivos en esta carpeta con estos nombres exactos:

| Archivo | Qué tiene que mostrar |
|---|---|
| `home.png`      | Página de inicio: hero ("Donde nace tu sonido") + sección de productos destacados visible. |
| `catalogo.png`  | `/productos` con la grilla de instrumentos visible y los filtros (buscador + selectores) arriba. |
| `detalle.png`   | Página de detalle de cualquier producto (ej: `/productos/1` Stratocaster) con la imagen grande, descripción y "Productos relacionados". |
| `carrito.png`   | `/carrito` con al menos 2 productos cargados, mostrando los items, cantidades y el resumen lateral con el total. |

### 4. Recargá la presentación

`Cmd + R` en `presentacion/index.html` y andá a la slide 5. Las imágenes deberían aparecer.

## Tips para que se vean bien

- **Resolución:** las capturas en pantalla retina ya quedan bien (~1500-2000px de ancho).
- **Formato:** PNG es lo más limpio para UI. Si las imágenes pesan mucho, podés convertir a JPG (renombrar a `.jpg` y editar el HTML).
- **Modo claro:** las screenshots quedan mejor con la app en modo claro (que ya está por default).
- **Sin barra de marcadores ni Dev Tools** — capturá solo el contenido del sitio para que se vea profesional.
- **Carrito con productos:** antes de capturar el carrito, agregá 2-3 instrumentos para que la pantalla no esté vacía.

## Si querés cambiar el tamaño de la grilla

Las 4 imágenes se acomodan en una grilla 2x2. Si querés otra distribución, editá `.screens` en el `<style>` de `index.html`:

```css
.screens {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* 2 columnas */
  grid-template-rows: 1fr 1fr;            /* 2 filas */
  ...
}
```
