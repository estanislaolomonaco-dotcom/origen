import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="container"
      style={{ padding: "4rem 0", textAlign: "center" }}
    >
      <h1>Pagina no encontrada</h1>
      <p className="text-muted">La pagina que buscas no existe.</p>
      <Link href="/" className="btn btn-accent" style={{ marginTop: "1rem" }}>
        Volver al inicio
      </Link>
    </div>
  );
}
