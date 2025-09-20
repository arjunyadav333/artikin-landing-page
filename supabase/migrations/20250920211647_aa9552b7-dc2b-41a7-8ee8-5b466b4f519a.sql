-- Update existing opportunities with proper default values where they are NULL
UPDATE opportunities 
SET 
  experience_level = 'Mid-level' 
WHERE experience_level IS NULL;

UPDATE opportunities 
SET 
  gender_preference = ARRAY['Any']
WHERE gender_preference IS NULL;

UPDATE opportunities 
SET 
  language_preference = ARRAY['English']
WHERE language_preference IS NULL;

UPDATE opportunities 
SET 
  organization_name = company 
WHERE organization_name IS NULL AND company IS NOT NULL;

-- Extract city and state from location field where possible
UPDATE opportunities 
SET 
  city = split_part(location, ',', 1),
  state = trim(split_part(location, ',', 2))
WHERE city IS NULL AND location IS NOT NULL AND location LIKE '%,%';