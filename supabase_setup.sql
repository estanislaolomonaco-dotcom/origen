-- ============================================================
-- MusicTrack — Supabase Setup SQL (v2, tolerante a tabla existente)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT NOT NULL,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Si la tabla ya existía sin la columna role, agregarla
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 3. Si la tabla ya existía sin name, agregarla
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS name TEXT;

-- 4. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Limpiar policies previas si existen
DROP POLICY IF EXISTS "Users can read own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own name"    ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles"  ON profiles;
DROP POLICY IF EXISTS "Service role full access"     ON profiles;

-- Lectura del propio perfil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Actualizar propio nombre
CREATE POLICY "Users can update own name"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert desde el trigger (service role)
CREATE POLICY "Service role full access"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 5. Función trigger: crea perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    CASE
      WHEN NEW.email = 'estani.lomonaco@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 6. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS en products (solo si la tabla existe y tiene columna active)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'active'
  ) THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can read active products" ON products;
    DROP POLICY IF EXISTS "Admin can read all products"     ON products;
    DROP POLICY IF EXISTS "Admin can insert products"       ON products;
    DROP POLICY IF EXISTS "Admin can update products"       ON products;
    DROP POLICY IF EXISTS "Admin can delete products"       ON products;

    CREATE POLICY "Public can read active products"
      ON products FOR SELECT
      USING (active = true OR active IS NULL);

    CREATE POLICY "Admin can insert products"
      ON products FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );

    CREATE POLICY "Admin can update products"
      ON products FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );

    CREATE POLICY "Admin can delete products"
      ON products FOR DELETE
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END;
$$;
