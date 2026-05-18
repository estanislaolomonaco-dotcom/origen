// Handler reutilizable para <img> que reemplaza la imagen
// si la URL original falla (404, red caida, etc.).
// Carga un placeholder con la paleta de la marca y el nombre del producto.

export function imageFallback(name) {
  return (e) => {
    // Evitamos loops infinitos si el fallback tambien falla.
    e.currentTarget.onerror = null;
    const text = encodeURIComponent(name || "Origen");
    e.currentTarget.src = `https://placehold.co/800x600/3e2723/faf6f0?text=${text}&font=roboto`;
  };
}
