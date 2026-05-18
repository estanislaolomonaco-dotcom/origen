// Página raíz del backend.
// No es un sitio público — solo da una pista al desarrollador
// que entró al hostname del backend.

export default function BackendRoot() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>MusicTrack API</h1>
      <p>Este es el backend. Los endpoints disponibles son:</p>
      <ul>
        <li><code>GET /api/products</code> — listado completo</li>
        <li><code>GET /api/products/:id</code> — un producto + relacionados</li>
        <li><code>GET /api/categories</code> — categorías únicas</li>
        <li><code>POST /api/orders</code> — crear orden</li>
      </ul>
      <p>El sitio público está en otra URL.</p>
    </main>
  );
}
