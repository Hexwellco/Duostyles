/*
# Remove automatic first-user admin assignment

## Purpose
The previous trigger auto-promoted the very first registered user to admin.
This removes that behavior so all new users are created as normal users (is_admin = false).
Admin status must now be granted manually by setting profiles.is_admin = true.

## Changes
- Updated create_profile_for_new_user() trigger function:
  - Removed the `NOT EXISTS (SELECT 1 FROM profiles)` first-user check
  - All new profiles are created with is_admin = false (the column default)
- Automatic profile creation after signup is preserved
- is_admin() helper function is unchanged
- All RLS policies are unchanged
*/

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