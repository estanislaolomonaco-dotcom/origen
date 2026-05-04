import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <h3 className={styles.title}>Origen</h3>
          <p className={styles.text}>
            Instrumentos musicales: guitarras electricas, acusticas, bajos y
            accesorios. Marcas seleccionadas, asesoramiento y envio a todo el
            pais. Donde nace tu sonido.
          </p>
        </div>

        <div>
          <h4 className={styles.subtitle}>Tienda</h4>
          <ul className={styles.list}>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/productos">Productos</Link>
            </li>
            <li>
              <Link href="/carrito">Carrito</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.subtitle}>Ayuda</h4>
          <ul className={styles.list}>
            <li>
              <a href="#">Preguntas frecuentes</a>
            </li>
            <li>
              <a href="#">Envios y devoluciones</a>
            </li>
            <li>
              <a href="#">Contacto</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.subtitle}>Seguinos</h4>
          <ul className={styles.list}>
            <li>
              <a href="#" aria-label="Instagram">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" aria-label="Twitter">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" aria-label="Facebook">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>&copy; {year} WebCommerce. Proyecto academico.</span>
      </div>
    </footer>
  );
}
