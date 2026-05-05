// Capa de acceso a órdenes.
// A diferencia de products, las orders SOLO funcionan con Supabase real:
// no tiene sentido "guardar" una orden en mock data — se perdería al recargar.
// Si las env vars no están, createOrder devuelve un orderId simulado para
// no romper el flujo de demo (mismo comportamiento que tenía el checkout antes).

import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

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

  return { orderId: order.order_code, persisted: true };
}
