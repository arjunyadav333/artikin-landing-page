-- Ensure organization-only operations are properly secured with RLS

-- Update opportunities RLS policies to be more explicit about organization role
-- Users can only create opportunities if they have role = 'organization'
DROP POLICY IF EXISTS "Users can create their own opportunities" ON opportunities;
CREATE POLICY "Organizations can create opportunities" ON opportunities
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'organization'
    )
  );

-- Users can only update/delete opportunities if they are the owner AND have organization role
DROP POLICY IF EXISTS "Users can update their own opportunities" ON opportunities;
CREATE POLICY "Organizations can update their opportunities" ON opportunities
  FOR UPDATE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'organization'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own opportunities" ON opportunities;
CREATE POLICY "Organizations can delete their opportunities" ON opportunities
  FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'organization'
    )
  );

-- Update opportunity applications to ensure only organizations can update application status
-- But allow users to update their own applications (status should only be 'pending' -> 'withdrawn')
DROP POLICY IF EXISTS "Users can update their own applications" ON opportunity_applications;
CREATE POLICY "Users can withdraw their applications" ON opportunity_applications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    (status = 'withdrawn' OR status = 'pending')
  );

-- Organizations can update applications for their opportunities
CREATE POLICY "Organizations can update applications for their opportunities" ON opportunity_applications
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM opportunities o
      JOIN profiles p ON p.user_id = o.user_id
      WHERE o.id = opportunity_applications.opportunity_id 
        AND o.user_id = auth.uid()
        AND p.role = 'organization'
    )
  );