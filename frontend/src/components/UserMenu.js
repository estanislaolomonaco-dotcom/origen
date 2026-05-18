"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.refresh();
  }

  if (loading) return <div className={styles.skeleton} />;

  if (!user) {
    return (
      <Link href="/login" className={styles.loginBtn}>
        Iniciar sesión
      </Link>
    );
  }

  const displayName = profile?.name || user.email?.split("@")[0] || "Usuario";
  const avatarUrl = user.user_metadata?.avatar_url;
  const isAdmin = profile?.role === "admin";

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menú de usuario"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatarFallback}>
            {displayName[0].toUpperCase()}
          </div>
        )}
        <span className={styles.name}>{displayName}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.5 6l3.5 3.5L11.5 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <p className={styles.dropdownEmail}>{user.email}</p>
            {isAdmin && <span className={styles.adminBadge}>Admin</span>}
          </div>
          <div className={styles.dropdownDivider} />
          <Link href="/perfil" className={styles.dropdownItem} onClick={() => setOpen(false)}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            Editar perfil
          </Link>
          {isAdmin && (
            <Link href="/admin" className={styles.dropdownItem} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>
              Panel admin
            </Link>
          )}
          <div className={styles.dropdownDivider} />
          <button className={`${styles.dropdownItem} ${styles.signOutBtn}`} onClick={handleSignOut}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
