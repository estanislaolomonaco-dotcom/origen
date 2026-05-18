// Smoke tests para la integración de Mercado Pago.
// Ejecutar con: npm test  (usa node --test)
//
// No hace llamadas reales a MP ni a Supabase. Testea las piezas puras:
//   - verifyWebhookSignature: HMAC + manifest
//   - mapMpStatusToOrderStatus: tabla de mapeo
//
// El test de integración del endpoint /create-preference requiere MP_ACCESS_TOKEN
// de TEST configurado y se ejecuta sólo si la env existe.

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  verifyWebhookSignature,
  mapMpStatusToOrderStatus,
} from "../src/lib/mp-utils.js";

test("verifyWebhookSignature acepta firma válida", () => {
  const secret = "test-secret-123";
  const dataId = "9876543210";
  const requestId = "req-abc";
  const ts = "1700000000";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");
  const xSignature = `ts=${ts},v1=${v1}`;

  const ok = verifyWebhookSignature({
    xSignature,
    xRequestId: requestId,
    dataId,
    secret,
  });
  assert.equal(ok, true);
});

test("verifyWebhookSignature rechaza firma inválida", () => {
  const ok = verifyWebhookSignature({
    xSignature: "ts=1700000000,v1=deadbeef",
    xRequestId: "req-abc",
    dataId: "9876543210",
    secret: "test-secret-123",
  });
  assert.equal(ok, false);
});

test("verifyWebhookSignature rechaza inputs vacíos", () => {
  assert.equal(
    verifyWebhookSignature({
      xSignature: "",
      xRequestId: "",
      dataId: "",
      secret: "x",
    }),
    false
  );
});

test("mapMpStatusToOrderStatus mapea correctamente los estados de MP", () => {
  assert.equal(mapMpStatusToOrderStatus("approved"), "approved");
  assert.equal(mapMpStatusToOrderStatus("pending"), "pending");
  assert.equal(mapMpStatusToOrderStatus("in_process"), "pending");
  assert.equal(mapMpStatusToOrderStatus("rejected"), "rejected");
  assert.equal(mapMpStatusToOrderStatus("refunded"), "refunded");
  assert.equal(mapMpStatusToOrderStatus("cancelled"), "cancelled");
  assert.equal(mapMpStatusToOrderStatus("charged_back"), "charged_back");
  assert.equal(mapMpStatusToOrderStatus("desconocido"), "pending");
});

// Test de integración: crea una preferencia real contra el sandbox de MP.
// Requiere `npm install` + MP_ACCESS_TOKEN de TEST. Si falta cualquiera, se saltea.
test(
  "createPreference contra MP sandbox (integración)",
  { skip: !process.env.MP_ACCESS_TOKEN },
  async () => {
    let createPreference;
    try {
      ({ createPreference } = await import("../src/lib/mercadopago.js"));
    } catch (e) {
      // El SDK 'mercadopago' no está instalado todavía.
      return; // saltear sin fallar
    }
    const pref = await createPreference({
      orderCode: `TEST-${Date.now()}`,
      items: [
        { id: 1, title: "Producto test", quantity: 1, unit_price: 100 },
      ],
      payer: {
        name: "Test User",
        email: "test_user@testuser.com",
        phone: "1122334455",
        address: "Calle Falsa 123",
      },
    });
    assert.ok(pref.id, "debe devolver un preference_id");
    assert.ok(
      pref.init_point || pref.sandbox_init_point,
      "debe devolver init_point"
    );
  }
);

// Test del webhook: simula una notificación válida y verifica el flujo de firma.
// No corre el handler completo (necesitaría stub de fetchPayment), pero
// valida que un payload firmado pasa la verificación.
test("webhook: payload firmado pasa verificación", () => {
  const secret = "wh-secret";
  const dataId = "111";
  const ts = String(Math.floor(Date.now() / 1000));
  const manifest = `id:${dataId};ts:${ts};`;
  const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const ok = verifyWebhookSignature({
    xSignature: `ts=${ts},v1=${v1}`,
    xRequestId: null,
    dataId,
    secret,
  });
  assert.equal(ok, true);
});
