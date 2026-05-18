"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import { formatPrice } from "@/lib/format";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, totalPrice, totalItems, clearCart, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="container">
        <h1>Carrito</h1>
        <p className="text-muted">Cargando carrito...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className={styles.empty}>
          <h1>Tu carrito esta vacio</h1>
          <p className="text-muted">
            Agrega productos para verlos aca y poder finalizar tu compra.
          </p>
          <Link href="/productos" className="btn btn-accent">
            Explorar productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Tu carrito</h1>
        <p className="text-muted">
          {totalItems} producto{totalItems === 1 ? "" : "s"} en tu carrito
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.list}>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <div className={styles.listActions}>
            <button
              type="button"
              onClick={clearCart}
              className="btn btn-outline"
            >
              Vaciar carrito
            </button>
            <Link href="/productos" className="btn btn-outline">
              Seguir comprando
            </Link>
          </div>
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen</h2>
          <div className={styles.row}>
            <span>Productos ({totalItems})</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className={styles.row}>
            <span>Envio</span>
            <span className="text-muted">A calcular</span>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link
            href="/checkout"
            className="btn btn-accent btn-block"
            style={{ marginTop: "1rem" }}
          >
            Finalizar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
