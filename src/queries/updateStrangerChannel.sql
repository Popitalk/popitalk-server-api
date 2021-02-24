UPDATE 
  channels
SET 
  type = 'friend',
  updated_at = NOW()
WHERE 
  id = $1;
