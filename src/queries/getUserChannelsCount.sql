SELECT
	COUNT(*)
FROM 
    channels
WHERE owner_id = $1
