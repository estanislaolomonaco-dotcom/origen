import Link from "next/link";
import styles from "./layout.module.css";

export const metadata = {
  title: "Admin | MusicTrack",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span>Panel Admin</span>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.sidebarLink}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
            Dashboard
          </Link>
          <Link href="/admin/productos" className={styles.sidebarLink}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
            Productos
          </Link>
          <Link href="/" className={styles.sidebarLink}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Volver al sitio
          </Link>
        </nav>
      </aside>
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
