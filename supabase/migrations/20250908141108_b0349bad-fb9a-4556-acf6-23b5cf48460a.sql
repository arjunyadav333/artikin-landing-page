-- Check if buckets exist and create only if needed
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('cover-pictures', 'cover-pictures', true)
ON CONFLICT (id) DO NOTHING;