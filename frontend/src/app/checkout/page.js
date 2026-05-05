"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { postOrder } from "@/lib/api";
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
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

    try {
      const { orderId } = await postOrder({
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          comments: form.comments,
        },
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
        })),
        total: totalPrice,
      });

      setConfirmed({
        id: orderId,
        name: form.name,
        email: form.email,
        total: totalPrice,
        items: totalItems,
      });
      clearCart();
      setForm(initialForm);
    } catch (err) {
      setSubmitError(err.message || "Error al confirmar la orden.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
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
            {submitting ? "Procesando..." : "Confirmar pedido"}
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
