// Script puntual para crear/actualizar el perfil del admin en Supabase.
// Necesita la SERVICE_ROLE key — leerla de env, NO hardcodearla.
//
// Uso: completar el archivo .env del root y correr:
//   node --env-file=.env fix-db.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan env vars: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Ver columnas reales de profiles
const { data: sample } = await supabase.from("profiles").select("*").limit(1);
const columns = sample?.length ? Object.keys(sample[0]) : [];
console.log("Columnas actuales de profiles:", columns);

// 2. Ver todos los usuarios registrados en auth
const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
if (usersErr) { console.error("Error listando usuarios:", usersErr); process.exit(1); }
console.log("Usuarios en auth.users:", users.map(u => ({ id: u.id, email: u.email })));

// 3. Buscar el admin
const adminUser = users.find(u => u.email === "estani.lomonaco@gmail.com");
if (!adminUser) {
  console.log("estani.lomonaco@gmail.com todavía no existe en auth.users — tiene que loguearse primero.");
  process.exit(0);
}
console.log("Admin encontrado:", adminUser.id);

// 4. Upsert con las columnas que existen
const payload = { id: adminUser.id };
if (columns.includes("role"))  payload.role  = "admin";
if (columns.includes("email")) payload.email = adminUser.email;
if (columns.includes("name"))  payload.name  = adminUser.user_metadata?.full_name || adminUser.email.split("@")[0];

const { error: upsertErr } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
if (upsertErr) {
  console.error("Error en upsert:", upsertErr);
} else {
  console.log("✓ Perfil de admin creado/actualizado:", payload);
}
