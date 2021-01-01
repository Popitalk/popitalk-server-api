SELECT 
  categories.name, 
  COUNT(channel_categories.channel_id) 
    FILTER 
      (
        WHERE channel_categories.channel_id IS NOT NULL
      ) 
    OVER ()
FROM 
   categories 
LEFT JOIN 
  channel_categories 
ON 
  categories.name = channel_categories.category_name
GROUP BY 
  categories.name, 
  channel_categories.channel_id
