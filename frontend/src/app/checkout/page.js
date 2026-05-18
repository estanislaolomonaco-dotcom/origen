"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { postOrder, createMpPreference } from "@/lib/api";
import styles from "./page.module.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  comments: "",
};

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart, hydrated } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);

  // Si no hay sesión, redirigir a login con ?next=/checkout.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [authLoading, user, router]);

  // Prefill con datos del perfil cuando se carga el user.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || profile?.name || user.user_metadata?.full_name || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user, profile]);
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ingresa tu nombre";
    if (!form.email.trim()) {
      e.email = "Ingresa tu email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email invalido";
    }
    if (!form.phone.trim()) {
      e.phone = "Ingresa un telefono";
    } else if (form.phone.replace(/\D/g, "").length < 6) {
      e.phone = "Telefono demasiado corto";
    }
    if (!form.address.trim()) e.address = "Ingresa una direccion";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    const customer = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      comments: form.comments,
    };
    const cartItems = items.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    }));

    try {
      // Obtener el access token actual de Supabase para autenticar al server.
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        router.replace("/login?next=/checkout");
        return;
      }

      if (paymentMethod === "mercadopago") {
        // Crear preferencia en el backend y redirigir a Checkout Pro.
        // El backend ya crea la orden internamente; no llamamos a postOrder.
        const { initPoint, sandboxInitPoint } = await createMpPreference({
          customer,
          items: cartItems,
        });
        clearCart();
        // En sandbox MP devuelve ambas URLs; preferimos sandbox si está.
        window.location.href = sandboxInitPoint || initPoint;
        return;
      }

      // Método "manual" / efectivo: flujo atómico con validación de stock.
      // El server valida auth + stock + recalcula total contra la BD.
      const { orderId, total: serverTotal } = await postOrder({
        customer,
        items: cartItems,
        accessToken,
      });

      setConfirmed({
        id: orderId,
        name: form.name,
        email: form.email,
        total: serverTotal ?? totalPrice,
        items: totalItems,
      });
      clearCart();
      setForm(initialForm);
    } catch (err) {
      if (err.code === "AUTH_REQUIRED") {
        router.replace("/login?next=/checkout");
        return;
      }
      setSubmitError(err.message || "Error al confirmar la orden.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || authLoading || !user) {
    return (
      <div className="container">
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="container">
        <div className={styles.success}>
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <h1>Pedido confirmado</h1>
          <p className="text-muted">
            Gracias por tu compra, <strong>{confirmed.name}</strong>. Te
            enviamos un correo de confirmacion a{" "}
            <strong>{confirmed.email}</strong>.
          </p>
          <div className={styles.orderInfo}>
            <div>
              <span className="text-muted">Numero de orden</span>
              <strong>{confirmed.id}</strong>
            </div>
            <div>
              <span className="text-muted">Productos</span>
              <strong>{confirmed.items}</strong>
            </div>
            <div>
              <span className="text-muted">Total</span>
              <strong>{formatPrice(confirmed.total)}</strong>
            </div>
          </div>
          <div className={styles.successActions}>
            <Link href="/" className="btn btn-outline">
              Volver al inicio
            </Link>
            <Link href="/productos" className="btn btn-accent">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className={styles.empty}>
          <h1>No hay productos en el carrito</h1>
          <p className="text-muted">
            Agrega productos antes de proceder al checkout.
          </p>
          <Link href="/productos" className="btn btn-accent">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: "1.5rem" }}>
        <h1>Checkout</h1>
        <p className="text-muted">
          Completa tus datos para finalizar la compra.
        </p>
      </header>

      <div className={styles.layout}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <h2 className={styles.formTitle}>Datos de contacto</h2>

          <div className={styles.field}>
            <label htmlFor="name">Nombre completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Telefono *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
              {errors.phone && (
                <span className={styles.error}>{errors.phone}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="address">Direccion de envio *</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Calle, numero, ciudad"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
            {errors.address && (
              <span className={styles.error}>{errors.address}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="comments">Comentarios (opcional)</label>
            <textarea
              id="comments"
              name="comments"
              rows={3}
              value={form.comments}
              onChange={handleChange}
              placeholder="Indicaciones para la entrega, referencias, etc."
            />
          </div>

          <h2 className={styles.formTitle} style={{ marginTop: "1.5rem" }}>
            Medio de pago
          </h2>
          <div className={styles.field}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="mercadopago"
                checked={paymentMethod === "mercadopago"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                <strong>Mercado Pago</strong>{" "}
                <span className="text-muted">
                  (tarjeta, débito, dinero en cuenta)
                </span>
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="manual"
                checked={paymentMethod === "manual"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                <strong>Coordinar al recibir</strong>{" "}
                <span className="text-muted">(efectivo / transferencia)</span>
              </span>
            </label>
          </div>

          {submitError && (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-accent btn-block"
            style={{ marginTop: "0.5rem" }}
            disabled={submitting}
          >
            {submitting
              ? "Procesando..."
              : paymentMethod === "mercadopago"
                ? "Pagar con Mercado Pago"
                : "Confirmar pedido"}
          </button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen de compra</h2>
          <ul className={styles.itemsList}>
            {items.map((it) => (
              <li key={it.id} className={styles.itemRow}>
                <span>
                  {it.name}{" "}
                  <span className="text-muted">x{it.quantity}</span>
                </span>
                <span>{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className={`${styles.itemRow} ${styles.totalRow}`}>
            <span>Total</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
