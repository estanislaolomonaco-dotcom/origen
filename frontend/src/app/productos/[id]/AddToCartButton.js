"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");

  function handleAdd() {
    if (product.stock <= 0) return;
    addItem(product, quantity);
    setFeedback(`${quantity} agregado al carrito`);
    setTimeout(() => setFeedback(""), 2500);
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className={styles.purchase}>
      <div className={styles.qtyRow}>
        <label htmlFor="qty">Cantidad</label>
        <div className={styles.qty}>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Disminuir"
          >
            -
          </button>
          <input
            id="qty"
            type="number"
            min="1"
            max={product.stock || 1}
            value={quantity}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= 1) setQuantity(v);
            }}
          />
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(product.stock || q + 1, q + 1))
            }
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-accent"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
        <Link href="/carrito" className="btn btn-outline">
          Ver carrito
        </Link>
      </div>

      {feedback && <p className={styles.feedback}>✓ {feedback}</p>}
    </div>
  );
}
