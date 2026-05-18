"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { totalItems, hydrated } = useCart();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <span className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f4c97a" />
                  <stop offset="100%" stopColor="#b8732e" />
                </linearGradient>
                <linearGradient id="pickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a1810" />
                  <stop offset="100%" stopColor="#0d0604" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="22" fill="url(#logoGrad)" />
              <path
                d="M24 12c5 0 9 2.4 9 6.5 0 4-3.2 9.8-6.5 13.8-1 1.2-1.9 2.1-2.5 2.1s-1.5-.9-2.5-2.1C18.2 28.3 15 22.5 15 18.5c0-4.1 4-6.5 9-6.5z"
                fill="url(#pickGrad)"
              />
              <path
                d="M20 17v12M24 16v14M28 17v12"
                stroke="url(#logoGrad)"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </span>
          <span className={styles.brandText}>MusicTrack</span>
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
          {isAdmin && (
            <Link href="/admin" className={`${styles.link} ${styles.adminLink}`}>
              Admin
            </Link>
          )}
          <Link
            href="/carrito"
            className={`${styles.link} ${styles.cartLink}`}
            aria-label="Carrito"
          >
            <svg
              className={styles.cartIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1.6" />
              <circle cx="18" cy="21" r="1.6" />
              <path d="M3 3h2.4l2.6 13.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.5L22 8H6" />
            </svg>
            {hydrated && totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </Link>
          <div className={styles.userMenuMobile}>
            <UserMenu />
          </div>
        </nav>

        <div className={styles.actions}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
