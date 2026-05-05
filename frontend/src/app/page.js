import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import ProductImage from "@/components/ProductImage";
import { fetchAllProducts, fetchAllCategories } from "@/lib/api";
import styles from "./page.module.css";

// Imagen representativa por categoria — usamos un producto de cada una.
const categoryVisuals = {
  Electricas: { image: "/products/stratocaster.jpg", icon: "🎸" },
  Acusticas: { image: "/products/folk.jpg", icon: "🪕" },
  Bajos: { image: "/products/jazzbass.jpg", icon: "🎵" },
  Accesorios: { image: "/products/amplificador.jpg", icon: "🔊" },
};

export default async function HomePage() {
  // Server Component: leemos productos y categorias desde la capa de datos
  // (Supabase si esta configurado, mock como fallback).
  const products = await fetchAllProducts();
  const categories = await fetchAllCategories();
  const featured = products.slice(0, 4);

  const benefits = [
    {
      title: "Probadas y testeadas",
      description: "Cada instrumento se prueba y se setea antes de salir del local.",
      icon: "🎸",
    },
    {
      title: "Envio rapido",
      description: "Despachamos en 24/48 horas con embalaje reforzado a todo el pais.",
      icon: "🚚",
    },
    {
      title: "Garantia oficial",
      description: "Todos los productos con garantia de fabrica y soporte tecnico.",
      icon: "🛡️",
    },
    {
      title: "Asesoramiento",
      description: "Te ayudamos a elegir el instrumento adecuado para tu nivel.",
      icon: "💬",
    },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>Instrumentos musicales</span>
            <h1 className={styles.heroTitle}>
              Donde nace tu <span className={styles.heroAccent}>sonido</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Guitarras electricas, acusticas, bajos y accesorios. Marcas
              seleccionadas para principiantes y profesionales. Envio a todo el
              pais y asesoramiento personalizado.
            </p>
            <div className={styles.heroActions}>
              <Link href="/productos" className="btn btn-accent">
                Ver instrumentos
              </Link>
              <Link href="#beneficios" className="btn btn-outline">
                Conocer mas
              </Link>
            </div>
          </div>

          <div className={styles.heroGrid} aria-hidden="true">
            <div className={`${styles.heroCell} ${styles.heroCellMain}`}>
              <ProductImage src="/products/stratocaster.jpg" alt="Stratocaster" />
              <span className={styles.heroBadge}>Eléctricas</span>
            </div>
            <div className={styles.heroCell}>
              <ProductImage src="/products/folk.jpg" alt="Acústica folk" />
              <span className={styles.heroBadge}>Acústicas</span>
            </div>
            <div className={styles.heroCell}>
              <ProductImage src="/products/jazzbass.jpg" alt="Bajo Jazz" />
              <span className={styles.heroBadge}>Bajos</span>
            </div>
            <div className={styles.heroCell}>
              <ProductImage src="/products/amplificador.jpg" alt="Amplificador" />
              <span className={styles.heroBadge}>Accesorios</span>
            </div>
          </div>
        </div>
      </section>

      {/* Banda de stats — entre hero y destacados */}
      <section className={styles.stats}>
        <div className={`container ${styles.statsInner}`}>
          <div className={styles.statItem}>
            <strong>12</strong>
            <span>instrumentos</span>
          </div>
          <div className={styles.statItem}>
            <strong>4</strong>
            <span>categorías</span>
          </div>
          <div className={styles.statItem}>
            <strong>24/48h</strong>
            <span>envío</span>
          </div>
          <div className={styles.statItem}>
            <strong>100%</strong>
            <span>garantía</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className="section-title">Productos destacados</h2>
            <Link href="/productos" className={styles.linkMore}>
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Categorías</h2>
          <p className={styles.sectionLead}>
            Encontrá tu instrumento ideal navegando por categoría.
          </p>
          <div className={styles.categories}>
            {categories.map((cat) => {
              const visual = categoryVisuals[cat] || {};
              return (
                <Link
                  key={cat}
                  href={`/productos?categoria=${encodeURIComponent(cat)}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImg} aria-hidden="true">
                    {visual.image && (
                      <ProductImage src={visual.image} alt="" />
                    )}
                    <div className={styles.categoryOverlay}></div>
                  </div>
                  <div className={styles.categoryContent}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      {visual.icon || "🎵"}
                    </span>
                    <span className={styles.categoryName}>{cat}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="beneficios">
        <div className="container">
          <h2 className="section-title">Por qué elegirnos</h2>
          <div className={styles.benefits}>
            {benefits.map((b) => (
              <div key={b.title} className={styles.benefit}>
                <div className={styles.benefitIcon} aria-hidden="true">
                  {b.icon}
                </div>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
