"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { imageFallback } from "@/lib/imageFallback";
import styles from "./CartItem.module.css";

export default function CartItem({ item }) {
  const { increment, decrement, removeItem } = useCart();
  const subtotal = item.price * item.quantity;

  return (
    <div className={styles.item}>
      <Link href={`/productos/${item.id}`} className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          onError={imageFallback(item.name)}
        />
      </Link>

      <div className={styles.info}>
        <span className={styles.category}>{item.category}</span>
        <Link href={`/productos/${item.id}`} className={styles.name}>
          {item.name}
        </Link>
        <span className={styles.unit}>
          Precio unitario: {formatPrice(item.price)}
        </span>
      </div>

      <div className={styles.qty}>
        <button
          type="button"
          onClick={() => decrement(item.id)}
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          onClick={() => increment(item.id)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <div className={styles.subtotal}>{formatPrice(subtotal)}</div>

      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className={styles.remove}
        aria-label={`Quitar ${item.name} del carrito`}
      >
        Quitar
      </button>
    </div>
  );
}
