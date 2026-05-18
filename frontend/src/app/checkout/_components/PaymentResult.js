"use client";

// Componente compartido por /checkout/success|failure|pending.
// Consulta el estado REAL de la orden contra el backend; los query params
// del redirect de MP son sólo una pista, no la fuente de verdad.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchOrderStatus } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const TITLES = {
  success: { title: "¡Pago aprobado!", icon: "✓" },
  pending: { title: "Pago en revisión", icon: "⏳" },
  failure: { title: "El pago no se completó", icon: "✕" },
};

export default function PaymentResult({ variant }) {
  const params = useSearchParams();
  // MP redirige con varios query params; nuestra back_url incluye `order`.
  const orderCode =
    params.get("order") ||
    params.get("external_reference") ||
    params.get("preference_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const data = await fetchOrderStatus(orderCode);
      if (!cancelled) {
        setOrder(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  const ui = TITLES[variant];

  return (
    <div className="container">
      <div
        style={{
          maxWidth: 560,
          margin: "3rem auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
          }}
          aria-hidden="true"
        >
          {ui.icon}
        </div>
        <h1>{ui.title}</h1>

        {loading && <p className="text-muted">Consultando estado...</p>}

        {!loading && !orderCode && (
          <p className="text-muted">
            No se recibió un identificador de orden. Si pagaste, revisá tu
            correo para la confirmación.
          </p>
        )}

        {!loading && orderCode && !order && (
          <p className="text-muted">
            No pudimos consultar la orden <strong>{orderCode}</strong>. Si el
            cargo aparece en tu resumen, contactanos.
          </p>
        )}

        {!loading && order && (
          <>
            <p className="text-muted">
              Orden <strong>{order.orderId}</strong>
            </p>
            <p>
              Estado actual: <strong>{order.status}</strong>
              {order.paymentStatus && (
                <>
                  {" "}
                  <span className="text-muted">
                    (pago: {order.paymentStatus})
                  </span>
                </>
              )}
            </p>
            <p>
              Total: <strong>{formatPrice(order.total)}</strong>
            </p>
          </>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
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
