import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import HeroSlider from "@/components/HeroSlider";
import { fetchAllProducts, fetchAllCategories } from "@/lib/api";
import styles from "./page.module.css";

const categoryMeta = {
  Electricas: {
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=75&auto=format&fit=crop",
    icon: "🎸",
    desc: "Stratocasters, Les Pauls y más",
  },
  Acusticas: {
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=75&auto=format&fit=crop",
    icon: "🪕",
    desc: "Folk, dreadnought y clásicas",
  },
  Bajos: {
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&q=75&auto=format&fit=crop",
    icon: "🎵",
    desc: "Jazz Bass, Precision y más",
  },
  Accesorios: {
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=75&auto=format&fit=crop",
    icon: "🔊",
    desc: "Amplificadores, cuerdas y más",
  },
};

const benefits = [
  {
    title: "Probadas y seteadas",
    description:
      "Cada instrumento se prueba, afina y setea antes de salir del local.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    title: "Envío en 24/48h",
    description: "Despachamos con embalaje reforzado a todo el país.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Garantía oficial",
    description: "Todos los productos con garantía de fábrica y soporte técnico.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Asesoramiento",
    description: "Te ayudamos a elegir el instrumento ideal para tu nivel.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const products = await fetchAllProducts();
  const categories = await fetchAllCategories();
  const featured = products.slice(0, 4);

  return (
    <>
      <HeroSlider />

      {/* Stats bar */}
      <section className={styles.stats}>
        <div className={`container ${styles.statsInner}`}>
          <div className={styles.statItem}>
            <strong>{products.length || 12}</strong>
            <span>instrumentos</span>
          </div>
          <div className={styles.statItem}>
            <strong>{categories.length || 4}</strong>
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

      {/* Featured products */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Lo más popular</p>
              <h2 className="section-title">Productos destacados</h2>
            </div>
            <Link href="/productos" className={styles.linkMore}>
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Categories */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <p className={styles.sectionKicker}>Explorá por tipo</p>
          <h2 className="section-title">Categorías</h2>
          <div className={styles.categories}>
            {categories.map((cat) => {
              const meta = categoryMeta[cat] || { icon: "🎵", desc: "" };
              return (
                <Link
                  key={cat}
                  href={`/productos?categoria=${encodeURIComponent(cat)}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImg}>
                    {meta.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={meta.image} alt="" loading="lazy" />
                    )}
                    <div className={styles.categoryOverlay} />
                  </div>
                  <div className={styles.categoryContent}>
                    <span className={styles.categoryIcon}>{meta.icon}</span>
                    <span className={styles.categoryName}>{cat}</span>
                    <span className={styles.categoryDesc}>{meta.desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section" id="beneficios">
        <div className="container">
          <p className={styles.sectionKicker}>Nuestra promesa</p>
          <h2 className="section-title">Por qué elegirnos</h2>
          <div className={styles.benefits}>
            {benefits.map((b) => (
              <div key={b.title} className={styles.benefit}>
                <div className={styles.benefitIcon}>{b.icon}</div>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2 className={styles.ctaTitle}>¿No sabés qué instrumento elegir?</h2>
            <p className={styles.ctaSubtitle}>
              Nuestro equipo te asesora sin costo para encontrar el instrumento perfecto para tu estilo y nivel.
            </p>
          </div>
          <Link href="/productos" className="btn btn-accent">
            Explorar catálogo
          </Link>
        </div>
      </section>
    </>
  );
}
