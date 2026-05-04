"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { totalItems, hydrated } = useCart();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <span className={styles.logoMark} aria-hidden="true">
            🎸
          </span>
          <span>Origen</span>
        </Link>

        <button
          className={styles.menuBtn}
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`${styles.nav} ${open ? styles.navOpen : ""}`}
          onClick={closeMenu}
        >
          <Link href="/" className={styles.link}>
            Inicio
          </Link>
          <Link href="/productos" className={styles.link}>
            Productos
          </Link>
          <Link href="/carrito" className={`${styles.link} ${styles.cartLink}`}>
            Carrito
            {hydrated && totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
