/*
# Add user profiles, generations, and admin access

## Purpose
Adds a user account system on top of the existing generation flow.
Profiles are auto-created when a user signs in with Google OAuth.
Generations are saved per-user after each successful AI generation.
An admin role allows the website owner to see all users and generations.

## New Tables

### profiles
- id (uuid, PK, references auth.users) — matches the Supabase auth user
- email (text, not null) — user email from OAuth
- name (text) — display name from Google OAuth metadata
- is_admin (boolean, default false) — admin flag; first registered user is auto-admin
- created_at (timestamptz) — profile creation timestamp

### generations
- id (uuid, PK) — unique generation record
- user_id (uuid, not null, defaults to auth.uid(), references auth.users) — owning user
- style_name (text, not null) — selected movie/style name
- image_url (text, not null) — public URL of the generated image in Storage
- status (text, default 'succeeded') — generation status
- created_at (timestamptz) — when the generation completed

## Security (RLS)

### profiles
- SELECT: users can read their own profile; admins can read all profiles
- UPDATE: users can update their own profile
- INSERT/DELETE: service_role only (profiles are auto-created by trigger)

### generations
- SELECT: users can read only their own generations; admins can read all
- INSERT: authenticated users can insert their own generations
- UPDATE/DELETE: users can modify only their own generations

## Functions / Triggers
- create_profile_for_new_user(): auto-creates a profile row when a new auth user
  is inserted. The very first user is automatically set as admin.
- is_admin(): helper that returns true if the current auth user has is_admin = true

## Important Notes
1. The first user to sign in via Google OAuth is automatically the admin.
2. Profiles are created automatically — no manual signup form needed.
3. The existing generation_jobs table and edge function are NOT modified.
4. Generated images remain in the existing generated-images public Storage bucket;
   access control is enforced at the database level (generations table RLS).
*/