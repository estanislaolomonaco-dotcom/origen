import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import ProductImage from "@/components/ProductImage";
import { products, categories } from "@/data/products";
import styles from "./page.module.css";

export default function HomePage() {
  // Tomamos los primeros 4 productos como destacados.
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
              Donde nace tu sonido
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
          <div className={styles.heroImage} aria-hidden="true">
            <ProductImage
              src="/products/lespaul.jpg"
              alt="Origen instrumentos"
            />
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
          <h2 className="section-title">Categorias</h2>
          <div className={styles.categories}>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/productos?categoria=${encodeURIComponent(cat)}`}
                className={styles.categoryCard}
              >
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="beneficios">
        <div className="container">
          <h2 className="section-title">Por que elegirnos</h2>
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
