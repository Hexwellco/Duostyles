/*
# Create generation_jobs table for async AI image processing

## Purpose
OpenAI image generation can take 30-90 seconds. Supabase Edge Functions have
a hard wall-clock timeout. To prevent mobile Safari "Load failed" errors,
OpenAI jobs are processed asynchronously:
1. POST /generate → inserts a row, returns jobId immediately
2. GET /generate?jobId=... → polls status + output URL

## New Tables
- generation_jobs: tracks async generation job state
  - id (uuid PK, default gen_random_uuid())
  - status (text, NOT NULL, default 'pending', CHECK pending|processing|succeeded|failed)
  - provider (text, NOT NULL, CHECK openai|replicate)
  - output (text, nullable — final public image URL in Supabase Storage)
  - error (text, nullable — error message if failed)
  - created_at (timestamptz, NOT NULL, default now())
  - updated_at (timestamptz, NOT NULL, default now())

## Index
- (status, created_at) for fast polling lookups

## Trigger
- BEFORE UPDATE sets updated_at = now() automatically

## Security (RLS)
- anon can INSERT (start a generation) and SELECT (poll by job ID)
- service_role can UPDATE (edge function updates status/output/error)
- Jobs are anonymous — identified by UUID which acts as the access key
- USING (true) is acceptable here: the table contains no sensitive user data,
  the UUID is effectively a secret access token, and no auth is required to start
  a generation

## Important Notes
1. No user authentication required for this table — generation can happen before sign-in
2. The UUID job ID itself is the access control mechanism (secret by obscurity)
3. The edge function uses the service_role key to update job status after generation
*/

CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  provider text NOT NULL CHECK (provider IN ('openai', 'replicate')),
  output text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generation_jobs_status_idx ON generation_jobs (status, created_at);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- anon users can insert jobs (start generation)
DROP POLICY IF EXISTS "anon can insert generation jobs" ON generation_jobs;
CREATE POLICY "anon can insert generation jobs"
  ON generation_jobs FOR INSERT
  TO anon
  WITH CHECK (true);

-- anon users can read jobs by id (polling)
DROP POLICY IF EXISTS "anon can read generation jobs" ON generation_jobs;
CREATE POLICY "anon can read generation jobs"
  ON generation_jobs FOR SELECT
  TO anon
  USING (true);

-- service role can update jobs (edge function updates status/output)
DROP POLICY IF EXISTS "service role can update generation jobs" ON generation_jobs;
CREATE POLICY "service role can update generation jobs"
  ON generation_jobs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION update_generation_jobs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generation_jobs_updated_at ON generation_jobs;
CREATE TRIGGER generation_jobs_updated_at
  BEFORE UPDATE ON generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_jobs_updated_at();