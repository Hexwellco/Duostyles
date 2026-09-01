/*
# Add admin access policies and auto-profile trigger

## Security changes
1. Admin users can read all profiles and all generations
2. is_admin() helper function checks if current user is admin

## Functions
- is_admin(): returns boolean, checks auth.uid() against profiles.is_admin
- create_profile_for_new_user(): trigger function that auto-creates a profile
  when a new auth user is inserted. New users are always created as non-admin.

## Triggers
- on_auth_user_created: fires after INSERT on auth.users, creates profile
*/

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

-- Drop old trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();