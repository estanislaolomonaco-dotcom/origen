import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
      <h1>Producto no encontrado</h1>
      <p className="text-muted">
        El producto que estas buscando no existe o fue removido.
      </p>
      <Link href="/productos" className="btn btn-accent" style={{ marginTop: "1rem" }}>
        Volver al catalogo
      </Link>
    </div>
  );
}
