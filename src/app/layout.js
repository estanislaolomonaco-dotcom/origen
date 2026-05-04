import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Origen | Instrumentos musicales",
  description:
    "Origen es una tienda online de instrumentos musicales: guitarras electricas, acusticas, bajos y accesorios. Donde nace tu sonido. Proyecto academico desarrollado con Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
