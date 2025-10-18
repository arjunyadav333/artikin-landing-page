-- Fix RLS security warning for backup table created in Phase 1
-- The backup table needs RLS enabled to pass security linting

-- Enable RLS on the backup table
ALTER TABLE posts_backup_phase1 ENABLE ROW LEVEL SECURITY;

-- Add a policy so only service role can access backups
CREATE POLICY "Only service role can access backup table"
ON posts_backup_phase1
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled
DO $$ 
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'posts_backup_phase1';
  
  IF rls_enabled THEN
    RAISE NOTICE '✓ RLS enabled on posts_backup_phase1';
  ELSE
    RAISE WARNING '⚠ RLS not enabled on posts_backup_phase1';
  END IF;
END $$;