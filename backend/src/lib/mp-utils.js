// Utilidades puras de Mercado Pago (sin dependencias externas).
// Vive aparte para poder testearlas sin instalar el SDK ni configurar alias.

import crypto from "node:crypto";

/**
 * Valida la firma del webhook de Mercado Pago.
 * Header `x-signature` con formato: "ts=<timestamp>,v1=<hash>".
 * Manifest: "id:<dataId>;request-id:<xRequestId>;ts:<ts>;"
 * HMAC-SHA256 con MP_WEBHOOK_SECRET.
 */
export function verifyWebhookSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
}) {
  if (!xSignature || !secret || !dataId) return false;

  const parts = Object.fromEntries(
    xSignature
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((p) => p.length === 2)
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest =
    `id:${dataId};` +
    (xRequestId ? `request-id:${xRequestId};` : "") +
    `ts:${ts};`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Mapea el status de MP al status interno de la orden. */
export function mapMpStatusToOrderStatus(mpStatus) {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "pending":
    case "in_process":
    case "authorized":
      return "pending";
    case "rejected":
      return "rejected";
    case "refunded":
      return "refunded";
    case "cancelled":
      return "cancelled";
    case "charged_back":
      return "charged_back";
    default:
      return "pending";
  }
}
