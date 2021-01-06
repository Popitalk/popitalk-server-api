SELECT
  categories.name 
FROM
  categories
INNER JOIN 
  channel_categories
ON 
  categories.name = channel_categories.category_name
WHERE 
  channel_categories.channel_id = $1 
