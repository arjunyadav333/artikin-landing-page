-- Add missing fields to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
ADD COLUMN deadline timestamp with time zone,
ADD COLUMN views_count integer DEFAULT 0;

-- Add index for better performance on status filtering
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_user_status ON public.opportunities(user_id, status);