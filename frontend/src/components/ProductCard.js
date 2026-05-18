"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { imageFallback } from "@/lib/imageFallback";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  function handleAdd(e) {
    e.preventDefault();
    addItem(product, 1);
  }

  return (
    <article className={styles.card}>
      <Link href={`/productos/${product.id}`} className={styles.imageWrap}>
        {/* Usamos img tag plano para no necesitar configuracion adicional de imagenes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={imageFallback(product.name)}
        />
      </Link>

      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>
          <Link href={`/productos/${product.id}`}>{product.name}</Link>
        </h3>
        <div className={styles.price}>{formatPrice(product.price)}</div>

        <div className={styles.actions}>
          <Link
            href={`/productos/${product.id}`}
            className="btn btn-outline"
          >
            Ver detalle
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-accent"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
