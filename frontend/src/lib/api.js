// Cliente HTTP del frontend hacia el backend de MusicTrack.
// El backend vive en su propio deploy (URL distinta) y expone:
//   GET  /api/products
//   GET  /api/products/:id
//   GET  /api/categories
//   POST /api/orders
//
// Si NEXT_PUBLIC_API_URL no está configurada o el backend no responde,
// caemos al mock local de src/data/products.js para que la app no se rompa
// (útil en build time si el backend no está deployado todavía).

import {
  products as mockProducts,
  categories as mockCategories,
} from "@/data/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

function isApiConfigured() {
  return !!API_URL;
}

// Helper interno con timeout y manejo de errores uniforme.
async function safeFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    // En Next 14 server components, sin cache para datos frescos.
    // Cambiar a `next: { revalidate: 60 }` para ISR si se quiere cachear.
    cache: options.cache || "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} -> ${res.status} ${text}`);
  }

  return res.json();
}

// =============== PRODUCTS ===============

export async function fetchAllProducts() {
  if (!isApiConfigured()) return mockProducts;

  try {
    const data = await safeFetch("/api/products");
    return data.products || [];
  } catch (e) {
    console.warn("[api] fetchAllProducts fallback to mock:", e.message);
    return mockProducts;
  }
}

export async function fetchProductById(id) {
  if (!isApiConfigured()) {
    const product = mockProducts.find((p) => p.id === Number(id)) || null;
    if (!product) return { product: null, related: [] };
    const related = mockProducts
      .filter((p) => p.id !== Number(id) && p.category === product.category)
      .slice(0, 4);
    return { product, related };
  }

  try {
    return await safeFetch(`/api/products/${encodeURIComponent(id)}`);
  } catch (e) {
    console.warn("[api] fetchProductById fallback to mock:", e.message);
    const product = mockProducts.find((p) => p.id === Number(id)) || null;
    if (!product) return { product: null, related: [] };
    const related = mockProducts
      .filter((p) => p.id !== Number(id) && p.category === product.category)
      .slice(0, 4);
    return { product, related };
  }
}

export async function fetchAllCategories() {
  if (!isApiConfigured()) return mockCategories;

  try {
    const data = await safeFetch("/api/categories");
    return data.categories || mockCategories;
  } catch (e) {
    console.warn("[api] fetchAllCategories fallback to mock:", e.message);
    return mockCategories;
  }
}

// IDs para SSG. En build time, si el backend no responde, usamos el mock.
export async function fetchAllProductIds() {
  const products = await fetchAllProducts();
  return products.map((p) => String(p.id));
}

// =============== ORDERS ===============

export async function postOrder({ customer, items, total }) {
  if (!isApiConfigured()) {
    // Sin backend: simulamos el orderId (mantiene el flujo de demo).
    const orderId = `MT-${Date.now().toString().slice(-6)}`;
    return { orderId, persisted: false };
  }

  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer, items, total }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  return res.json();
}
