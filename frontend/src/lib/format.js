// Formato de precio en pesos argentinos.
// Centralizado para reutilizar en toda la app.
export function formatPrice(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return `$${value}`;
  }
}
