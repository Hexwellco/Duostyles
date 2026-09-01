/*
# Add user profiles and generations tables

## Tables
- profiles: user profile data (id, email, name, is_admin, created_at)
- generations: per-user generation records (user_id, style_name, image_url, status)
*/

-- ── Profiles table ──
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Generations table ──
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  style_name text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Users can read their own generations
DROP POLICY IF EXISTS "Users can read own generations" ON generations;
CREATE POLICY "Users can read own generations"
  ON generations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own generations
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generations
DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations (user_id, created_at DESC);