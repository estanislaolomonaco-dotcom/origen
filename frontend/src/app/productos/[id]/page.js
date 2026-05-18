import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchProductById,
  fetchAllProductIds,
} from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/lib/format";
import styles from "./page.module.css";

// SSG: generamos una página estática por cada producto en build time.
export async function generateStaticParams() {
  const ids = await fetchAllProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { product } = await fetchProductById(params.id);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | MusicTrack`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }) {
  const { product, related } = await fetchProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/productos">Productos</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.detail}>
        <div className={styles.imageWrap}>
          <ProductImage src={product.image} alt={product.name} />
        </div>

        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>{formatPrice(product.price)}</div>

          <p className={styles.description}>{product.description}</p>

          <ul className={styles.meta}>
            <li>
              <strong>Stock:</strong>{" "}
              {product.stock > 0
                ? `${product.stock} unidades disponibles`
                : "Sin stock"}
            </li>
            <li>
              <strong>Categoria:</strong> {product.category}
            </li>
            <li>
              <strong>Codigo:</strong> #{String(product.id).padStart(4, "0")}
            </li>
          </ul>

          <AddToCartButton product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2 className="section-title">Productos relacionados</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
