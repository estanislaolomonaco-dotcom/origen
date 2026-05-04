import { Suspense } from "react";
import ProductsView from "./ProductsView";

export const metadata = {
  title: "Instrumentos | Origen",
};

export default function ProductsPage() {
  return (
    <div className="container">
      <header style={{ marginBottom: "1.5rem" }}>
        <h1>Nuestros instrumentos</h1>
        <p className="text-muted">
          Filtra por categoria, buscalos por nombre y encontra tu proximo
          instrumento.
        </p>
      </header>

      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <ProductsView />
      </Suspense>
    </div>
  );
}
