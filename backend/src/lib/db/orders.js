// Capa de acceso a órdenes.
// A diferencia de products, las orders SOLO funcionan con Supabase real:
// no tiene sentido "guardar" una orden en mock data — se perdería al recargar.
// Si las env vars no están, createOrder devuelve un orderId simulado para
// no romper el flujo de demo (mismo comportamiento que tenía el checkout antes).

import {
  getSupabaseServerClient,
  getSupabaseUserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

/**
 * Flujo completo de compra en una sola transacción Postgres.
 * La función SQL `public.checkout(items, customer)` se encarga de:
 *   - validar auth.uid()
 *   - lockear filas de products (FOR UPDATE)
 *   - validar stock
 *   - recalcular total con precios reales de la BD
 *   - insertar orden + items
 *   - descontar stock
 *
 * @param {string} accessToken  - JWT del usuario autenticado.
 * @param {Object} input
 * @param {Object} input.customer - { name, email, phone, address, comments }
 * @param {Array}  input.items    - [{ id, quantity }]
 * @returns {Promise<{ orderId: string, orderDbId: number, total: number }>}
 */
export async function createOrderForUser(accessToken, { customer, items }) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }
  const supabase = getSupabaseUserClient(accessToken);
  if (!supabase) throw new Error("AUTH_REQUIRED");

  const { data, error } = await supabase.rpc("checkout", {
    p_items: items.map((it) => ({ id: it.id, quantity: it.quantity })),
    p_customer: customer,
  });

  if (error) {
    // Mensajes amigables para los códigos que tira la función Postgres.
    const msg = error.message || "";
    if (msg.includes("AUTH_REQUIRED")) {
      const e = new Error("Tenés que iniciar sesión para comprar.");
      e.code = "AUTH_REQUIRED";
      throw e;
    }
    if (msg.includes("CART_EMPTY")) {
      throw new Error("El carrito está vacío.");
    }
    if (msg.includes("CUSTOMER_INVALID")) {
      throw new Error("Faltan datos del comprador.");
    }
    if (msg.includes("STOCK_INSUFFICIENT:")) {
      const name = msg.split("STOCK_INSUFFICIENT:")[1]?.split('"')[0] ?? "un producto";
      throw new Error(`Stock insuficiente para "${name.trim()}".`);
    }
    if (msg.includes("PRODUCT_NOT_FOUND")) {
      throw new Error("Uno de los productos ya no existe.");
    }
    if (msg.includes("QTY_INVALID")) {
      throw new Error("Cantidad inválida en uno de los items.");
    }
    console.error("[db/orders] checkout RPC error:", error);
    throw new Error("No se pudo crear la orden.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    orderId: row.order_code,
    orderDbId: row.order_id,
    total: row.total,
  };
}

function generateOrderCode() {
  return `MT-${Date.now().toString().slice(-6)}`;
}

/**
 * Crea una orden en la base con todos sus items.
 * @param {Object} input
 * @param {Object} input.customer - { name, email, phone, address, comments }
 * @param {Array} input.items - [{ id, name, price, quantity }]
 * @param {number} input.total - total en la moneda base (entero)
 * @returns {Promise<{ orderId: string, persisted: boolean }>}
 */
export async function createOrder({ customer, items, total }) {
  const orderCode = generateOrderCode();

  // Si Supabase no esta configurado, devolvemos un orderId simulado
  // (manteniendo el comportamiento previo del checkout, sin romper la demo).
  if (!isSupabaseConfigured()) {
    return { orderId: orderCode, persisted: false };
  }

  const supabase = getSupabaseServerClient();

  // 1) Insertar la orden y traer su id real
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_code: orderCode,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      comments: customer.comments || null,
      total,
      status: "pending",
    })
    .select("id, order_code")
    .single();

  if (orderError || !order) {
    console.error("[db/orders] insert order error:", orderError?.message);
    throw new Error("No se pudo crear la orden.");
  }

  // 2) Insertar los items asociados
  const itemsRows = items.map((it) => ({
    order_id: order.id,
    product_id: Number(it.id) || null,
    product_name: it.name,
    unit_price: it.price,
    quantity: it.quantity,
    subtotal: it.price * it.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsRows);

  if (itemsError) {
    console.error("[db/orders] insert items error:", itemsError.message);
    // La orden ya quedó creada; no abortamos. En producción esto ameritaría
    // una transacción real con stored procedure (próxima iteración).
  }

  return { orderId: order.order_code, orderDbId: order.id, persisted: true };
}

/**
 * Trae una orden (con sus items) por order_code.
 * Devuelve null si no existe o si Supabase no está configurado.
 */
export async function getOrderByCode(orderCode) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, customer_name, customer_email, customer_phone, customer_address, total, status, payment_provider, payment_id, payment_status, payment_preference_id, created_at"
    )
    .eq("order_code", orderCode)
    .single();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name, unit_price, quantity, subtotal")
    .eq("order_id", order.id);

  return { ...order, items: items || [] };
}

/**
 * Valida items y precios contra la BD (anti-tampering: nunca confiar en el front).
 * Re-lee productos por id, chequea stock y recalcula el total con precios reales.
 */
export async function validateOrderItemsAgainstDb(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items vacíos.");
  }
  if (!isSupabaseConfigured()) {
    // Sin Supabase no podemos validar contra DB; modo demo.
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { items, total, validatedAgainstDb: false };
  }

  const supabase = getSupabaseServerClient();
  const ids = items.map((i) => Number(i.id)).filter(Boolean);

  const { data: dbProducts, error } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .in("id", ids);

  if (error || !dbProducts) {
    throw new Error("No se pudieron validar los productos.");
  }

  const byId = new Map(dbProducts.map((p) => [p.id, p]));
  const validated = items.map((it) => {
    const db = byId.get(Number(it.id));
    if (!db) throw new Error(`Producto ${it.id} no existe.`);
    if (it.quantity > db.stock) {
      throw new Error(`Stock insuficiente para "${db.name}".`);
    }
    return {
      id: db.id,
      name: db.name,
      price: db.price,
      quantity: it.quantity,
    };
  });

  const total = validated.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items: validated, total, validatedAgainstDb: true };
}

/**
 * Actualiza datos de pago de una orden de forma idempotente.
 * Si ya tiene el mismo payment_id y payment_status no hace nada.
 */
export async function updateOrderPayment({
  orderCode,
  paymentId,
  paymentStatus,
  status,
  preferenceId,
  rawResponse,
}) {
  if (!isSupabaseConfigured()) {
    return { updated: false, alreadyProcessed: false };
  }
  const supabase = getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("payment_id, payment_status, status")
    .eq("order_code", orderCode)
    .single();

  if (
    existing &&
    existing.payment_id === String(paymentId) &&
    existing.payment_status === paymentStatus
  ) {
    return { updated: false, alreadyProcessed: true };
  }

  const patch = {
    payment_provider: "mercadopago",
    ...(paymentId ? { payment_id: String(paymentId) } : {}),
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    ...(status ? { status } : {}),
    ...(preferenceId ? { payment_preference_id: preferenceId } : {}),
    ...(rawResponse ? { payment_raw_response: rawResponse } : {}),
  };

  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("order_code", orderCode);

  if (error) {
    console.error("[db/orders] updateOrderPayment error:", error.message);
    throw new Error("No se pudo actualizar el pago de la orden.");
  }

  return { updated: true, alreadyProcessed: false };
}

// Re-exportamos el mapper desde el módulo puro (testeable sin alias).
export { mapMpStatusToOrderStatus } from "../mp-utils.js";
