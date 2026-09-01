/*
# Create profiles and generations tables with admin access and auto-profile trigger

## Purpose
Adds a user account system on top of the existing generation flow.
Profiles are auto-created when a user signs in (Google OAuth or email/password).
Generations are saved per-user after each successful AI generation.
An admin role allows the website owner to see all users and generations.

## New Tables

### profiles
- id (uuid PK, references auth.users(id) ON DELETE CASCADE)
- email (text, NOT NULL) — user email from auth
- name (text, nullable) — display name from OAuth metadata or email prefix
- is_admin (boolean, NOT NULL, default false) — admin flag
- created_at (timestamptz, NOT NULL, default now())

### generations
- id (uuid PK, default gen_random_uuid())
- user_id (uuid, NOT NULL, default auth.uid(), references auth.users(id) ON DELETE CASCADE)
- style_name (text, NOT NULL) — selected movie/style name
- image_url (text, NOT NULL) — public URL of the generated image in Storage
- status (text, NOT NULL, default 'succeeded', CHECK succeeded|failed)
- created_at (timestamptz, NOT NULL, default now())

## Index
- generations (user_id, created_at DESC) for fast per-user history queries

## Functions
- is_admin(): SECURITY DEFINER, SQL — returns true if current user's profiles.is_admin = true
- create_profile_for_new_user(): SECURITY DEFINER, plpgsql trigger — auto-creates a
  profile row when a new auth user is inserted. Uses raw_user_meta_data->>'full_name'
  or ->>'name' or email prefix for the display name. Always sets is_admin = false.

## Triggers
- on_auth_user_created: AFTER INSERT ON auth.users → creates profile

## Security (RLS)

### profiles
- SELECT: users can read own profile (auth.uid() = id); admins can read all (is_admin())
- UPDATE: users can update own profile (auth.uid() = id)
- INSERT/DELETE: not allowed for users — profiles are auto-created by trigger only

### generations
- SELECT: users can read own generations (auth.uid() = user_id); admins can read all (is_admin())
- INSERT: authenticated users can insert own generations (auth.uid() = user_id)
- UPDATE: users can update own generations (auth.uid() = user_id)
- DELETE: users can delete own generations (auth.uid() = user_id)

## Important Notes
1. user_id defaults to auth.uid() so frontend inserts that omit user_id still satisfy RLS
2. Admin status must be granted manually (set profiles.is_admin = true) — no auto-admin
3. is_admin() is SECURITY DEFINER so it can read profiles from within RLS-protected queries
4. All policies use DROP IF EXISTS first for idempotency
5. The existing generation_jobs table and edge function are NOT modified
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

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

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

DROP POLICY IF EXISTS "Users can read own generations" ON generations;
CREATE POLICY "Users can read own generations"
  ON generations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations (user_id, created_at DESC);

-- ── Helper: is_admin() ──
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ── Admin can read all profiles ──
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin());

-- ── Admin can read all generations ──
DROP POLICY IF EXISTS "Admin can read all generations" ON generations;
CREATE POLICY "Admin can read all generations"
  ON generations FOR SELECT TO authenticated
  USING (is_admin());

-- ── Auto-create profile when a new auth user signs in ──
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();