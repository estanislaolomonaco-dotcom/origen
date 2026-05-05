// Capa de acceso a datos de productos.
// Si Supabase está configurado (env vars presentes), usa la base real.
// Si no, cae al mock local de src/data/products.js.
// Esto permite que el deploy actual siga funcionando sin Supabase
// hasta que se configuren las env vars.

import { products as mockProducts, categories as mockCategories } from "@/data/products";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function findAllProducts() {
  if (!isSupabaseConfigured()) return mockProducts;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("[db/products] findAllProducts error:", error.message);
    return mockProducts;
  }
  return data;
}

export async function findProductById(id) {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.id === Number(id)) || null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (error) {
    console.error("[db/products] findProductById error:", error.message);
    return null;
  }
  return data;
}

export async function findRelatedProducts(productId, category, limit = 4) {
  if (!isSupabaseConfigured()) {
    return mockProducts
      .filter((p) => p.id !== Number(productId) && p.category === category)
      .slice(0, limit);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", Number(productId))
    .limit(limit);

  if (error) {
    console.error("[db/products] findRelatedProducts error:", error.message);
    return [];
  }
  return data || [];
}

export async function findAllCategories() {
  if (!isSupabaseConfigured()) return mockCategories;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("category");

  if (error || !data) return mockCategories;
  return [...new Set(data.map((row) => row.category))];
}

// Para generateStaticParams en /productos/[id]
export async function findAllProductIds() {
  if (!isSupabaseConfigured()) {
    return mockProducts.map((p) => String(p.id));
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("id");

  if (error || !data) return mockProducts.map((p) => String(p.id));
  return data.map((row) => String(row.id));
}
