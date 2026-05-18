import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products, emptyMessage }) {
  if (!products || products.length === 0) {
    return (
      <p className={styles.empty}>
        {emptyMessage || "No se encontraron productos."}
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
