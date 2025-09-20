-- Add art forms to existing opportunities for display
UPDATE opportunities 
SET art_forms = CASE 
  WHEN title ILIKE '%dance%' OR title ILIKE '%dancer%' THEN ARRAY['Dance']
  WHEN title ILIKE '%actor%' OR title ILIKE '%acting%' OR title ILIKE '%movie%' OR title ILIKE '%film%' OR title ILIKE '%theater%' OR title ILIKE '%theatre%' THEN ARRAY['Acting']
  WHEN title ILIKE '%singer%' OR title ILIKE '%music%' OR title ILIKE '%vocal%' THEN ARRAY['Music']
  WHEN title ILIKE '%model%' OR title ILIKE '%fashion%' THEN ARRAY['Fashion']
  WHEN title ILIKE '%photographer%' OR title ILIKE '%photo%' THEN ARRAY['Photography']
  WHEN title ILIKE '%writer%' OR title ILIKE '%writing%' THEN ARRAY['Writing']
  ELSE ARRAY['Acting', 'Dance']
END
WHERE art_forms IS NULL;