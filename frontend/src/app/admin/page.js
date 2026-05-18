import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

async function getMetrics(supabase) {
  const [productsRes, ordersRes, recentOrdersRes] = await Promise.allSettled([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalProducts = productsRes.status === "fulfilled" ? productsRes.value.count ?? 0 : 0;
  const totalOrders   = ordersRes.status === "fulfilled"   ? ordersRes.value.count ?? 0   : 0;
  const recentOrders  = recentOrdersRes.status === "fulfilled" ? recentOrdersRes.value.count ?? 0 : 0;

  return { totalProducts, totalOrders, recentOrders };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const metrics = await getMetrics(supabase);

  const cards = [
    {
      label: "Productos",
      value: metrics.totalProducts,
      sub: "en el catálogo",
      color: "accent",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4V2H17V4H20C20.5523 4 21 4.44772 21 5V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V5C3 4.44772 3.44772 4 4 4H7ZM9 4H15V6H9V4ZM5 8V20H19V8H5ZM11 10H13V18H11V10ZM7 13H9V18H7V13ZM15 12H17V18H15V12Z" />
        </svg>
      ),
    },
    {
      label: "Pedidos totales",
      value: metrics.totalOrders,
      sub: "desde el inicio",
      color: "primary",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 16V4H2V2H5C5.55228 2 6 2.44772 6 3V15H18.4384L20.4384 7H8V5H21.7237C22.2678 5 22.7076 5.45531 22.6693 5.9979L21.1693 17.9979C21.1368 18.4662 20.7443 18.8284 20.2744 18.8284H5C4.44772 18.8284 4 18.3807 4 17.8284V16ZM6 23C4.89543 23 4 22.1046 4 21C4 19.8954 4.89543 19 6 19C7.10457 19 8 19.8954 8 21C8 22.1046 7.10457 23 6 23ZM18 23C16.8954 23 16 22.1046 16 21C16 19.8954 16.8954 19 18 19C19.1046 19 20 19.8954 20 21C20 22.1046 19.1046 23 18 23Z" />
        </svg>
      ),
    },
    {
      label: "Pedidos este mes",
      value: metrics.recentOrders,
      sub: "últimos 30 días",
      color: "success",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4ZM10 7H12V10.999L16 11V13L10 13.001V7Z" />
        </svg>
      ),
    },
    {
      label: "Categorías",
      value: 4,
      sub: "Eléctricas, Acústicas, Bajos, Accesorios",
      color: "muted",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3H11V11H3V3ZM3 13H11V21H3V13ZM13 3H21V11H13V3ZM13 13H21V21H13V13Z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>
          Resumen del negocio en tiempo real
        </p>
      </div>

      <div className={styles.metricsGrid}>
        {cards.map((card) => (
          <div key={card.label} className={`${styles.metricCard} ${styles[`metricCard_${card.color}`]}`}>
            <div className={styles.metricIcon}>{card.icon}</div>
            <div className={styles.metricBody}>
              <div className={styles.metricValue}>{card.value}</div>
              <div className={styles.metricLabel}>{card.label}</div>
              <div className={styles.metricSub}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
        <div className={styles.quickGrid}>
          <a href="/admin/productos" className={styles.quickCard}>
            <strong>Ver productos</strong>
            <span>Gestioná el catálogo completo</span>
          </a>
          <a href="/admin/productos?action=new" className={styles.quickCard}>
            <strong>Nuevo producto</strong>
            <span>Agregá un instrumento al catálogo</span>
          </a>
          <a href="/productos" className={styles.quickCard}>
            <strong>Ver tienda</strong>
            <span>Cómo la ve el cliente</span>
          </a>
        </div>
      </div>
    </div>
  );
}
