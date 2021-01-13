SELECT 
  categories.name,
  COUNT(CASE WHEN channel_categories.category_name IS NOT NULL THEN 0 END) 
FROM 
   categories
LEFT JOIN 
  channel_categories 
ON 
  categories.name = channel_categories.category_name
GROUP BY 
  categories.name
ORDER BY    
    count DESC
LIMIT 3
            