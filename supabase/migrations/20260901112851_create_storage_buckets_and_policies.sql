/*
# Create storage buckets and access policies

## Summary
Creates three storage buckets used by the AI image generation app:
1. replicate-uploads — public bucket for Replicate API to fetch images via HTTPS (legacy path)
2. generated-images — public bucket for AI-generated output images (uploaded by edge function)
3. generation-inputs — private bucket for user-uploaded source photos (uploaded by frontend)

## Buckets
- replicate-uploads: public, no size/mime limits
- generated-images: public, 10MB limit, jpeg/png/webp only
- generation-inputs: private, 8MB limit, jpeg/png/webp only

## Security
- generated-images: service_role INSERT, public SELECT (images shared via public URLs)
- replicate-uploads: service_role INSERT, public SELECT (Replicate needs public HTTPS access)
- generation-inputs: anon + authenticated get INSERT/SELECT/DELETE (app works both signed-in and unsigned-in); service_role gets SELECT/DELETE for edge function processing
- generation-inputs is private (not public) — files are accessed via signed URLs
- Each file path is scoped to a random requestId prefix to prevent collisions

## Important Notes
1. All policies use DROP IF EXISTS first for idempotency (safe to re-run)
2. Both anon AND authenticated roles can access generation-inputs because the app supports unauthenticated and Google OAuth flows
3. generated-images is public-read because output images are shared via public URLs
*/

-- ── Bucket: replicate-uploads (public, legacy) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('replicate-uploads', 'replicate-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Service role can upload replicate images" ON storage.objects;
CREATE POLICY "Service role can upload replicate images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'replicate-uploads');

DROP POLICY IF EXISTS "Public can read replicate images" ON storage.objects;
CREATE POLICY "Public can read replicate images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'replicate-uploads');

-- ── Bucket: generated-images (public) ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "service_role can upload generated images" ON storage.objects;
CREATE POLICY "service_role can upload generated images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-images');

DROP POLICY IF EXISTS "public can read generated images" ON storage.objects;
CREATE POLICY "public can read generated images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'generated-images');

-- ── Bucket: generation-inputs (private) ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generation-inputs',
  'generation-inputs',
  false,
  8388608,  -- 8MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- anon users
DROP POLICY IF EXISTS "anon users can upload input images" ON storage.objects;
CREATE POLICY "anon users can upload input images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'generation-inputs');

DROP POLICY IF EXISTS "anon users can read input images" ON storage.objects;
CREATE POLICY "anon users can read input images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'generation-inputs');

DROP POLICY IF EXISTS "anon users can delete input images" ON storage.objects;
CREATE POLICY "anon users can delete input images"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'generation-inputs');

-- authenticated users
DROP POLICY IF EXISTS "authenticated users can upload input images" ON storage.objects;
CREATE POLICY "authenticated users can upload input images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generation-inputs');

DROP POLICY IF EXISTS "authenticated users can read input images" ON storage.objects;
CREATE POLICY "authenticated users can read input images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'generation-inputs');

DROP POLICY IF EXISTS "authenticated users can delete input images" ON storage.objects;
CREATE POLICY "authenticated users can delete input images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'generation-inputs');

-- service role (edge function)
DROP POLICY IF EXISTS "service role can read input images" ON storage.objects;
CREATE POLICY "service role can read input images"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'generation-inputs');

DROP POLICY IF EXISTS "service role can delete input images" ON storage.objects;
CREATE POLICY "service role can delete input images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'generation-inputs');