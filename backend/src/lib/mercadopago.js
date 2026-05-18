// Cliente y helpers de Mercado Pago.
//
// Decisión: usamos Checkout Pro (redirect a init_point) en lugar de Bricks.
// Motivos:
//   - El frontend usa CSS Modules sin librerías de UI; integrar Bricks suma
//     dependencia (@mercadopago/sdk-react) y CSS propio difícil de tematizar.
//   - Con Checkout Pro no exponemos NADA del lado cliente (ni public_key):
//     todo el flujo sensible vive en el backend.
//   - Es más simple de probar y de cumplir con la consigna de seguridad.
// Si en el futuro queremos checkout embebido, este módulo se reutiliza:
// sólo cambia cómo el frontend consume `preference_id`.

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
export { verifyWebhookSignature } from "./mp-utils.js";

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no configurado.");
  }

  cachedClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10000 },
  });
  return cachedClient;
}

export function isMercadoPagoConfigured() {
  return !!process.env.MP_ACCESS_TOKEN;
}

/**
 * Crea una preferencia de pago en MP a partir de una orden ya persistida.
 *
 * @param {Object} input
 * @param {string} input.orderCode - external_reference (ID human-readable de la orden).
 * @param {Array<{id, title, quantity, unit_price}>} input.items
 * @param {Object} input.payer - { name, email, phone, address }
 * @returns {Promise<{ id: string, init_point: string, sandbox_init_point: string }>}
 */
export async function createPreference({ orderCode, items, payer }) {
  const client = getClient();
  const preference = new Preference(client);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const backendUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";

  const body = {
    items: items.map((it) => ({
      id: String(it.id),
      title: it.title,
      quantity: it.quantity,
      unit_price: it.unit_price,
      currency_id: "ARS",
    })),
    payer: {
      name: payer.name,
      email: payer.email,
      ...(payer.phone
        ? { phone: { number: String(payer.phone) } }
        : {}),
      ...(payer.address
        ? { address: { street_name: payer.address } }
        : {}),
    },
    back_urls: {
      success: `${frontendUrl}/checkout/success?order=${encodeURIComponent(orderCode)}`,
      failure: `${frontendUrl}/checkout/failure?order=${encodeURIComponent(orderCode)}`,
      pending: `${frontendUrl}/checkout/pending?order=${encodeURIComponent(orderCode)}`,
    },
    auto_return: "approved",
    notification_url: `${backendUrl}/api/payments/mercadopago/webhook`,
    external_reference: orderCode,
    statement_descriptor: "MUSICTRACK",
  };

  const res = await preference.create({ body });
  return {
    id: res.id,
    init_point: res.init_point,
    sandbox_init_point: res.sandbox_init_point,
  };
}

/**
 * Consulta un pago en la API de MP por su id.
 * Nunca confiar en el payload del webhook directamente; siempre re-consultar acá.
 */
export async function fetchPayment(paymentId) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}

// verifyWebhookSignature se re-exporta desde ./mp-utils.js (módulo puro).
