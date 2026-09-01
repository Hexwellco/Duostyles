/*
# Fix generation-inputs bucket: allow authenticated user uploads

## Problem
The previous fix only granted INSERT/SELECT/DELETE to the `anon` role.
When a user signs in, their role becomes `authenticated`, which has no
policy on this bucket — so uploads fail with a 403 and generation
aborts with "Could not upload images."

## Fix
Add INSERT, SELECT, and DELETE policies for `authenticated` on the
generation-inputs bucket, mirroring the existing anon policies.

## Security
Files are short-lived temporary input images in a private bucket.
Each path is scoped to a random requestId prefix, so collisions are
negligible. Service role retains its existing access.
*/

-- Authenticated users can upload input images
CREATE POLICY "authenticated users can upload input images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generation-inputs');

-- Authenticated users can read input images (needed for signed URL generation)
CREATE POLICY "authenticated users can read input images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'generation-inputs');

-- Authenticated users can delete input images (cleanup)
CREATE POLICY "authenticated users can delete input images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'generation-inputs');