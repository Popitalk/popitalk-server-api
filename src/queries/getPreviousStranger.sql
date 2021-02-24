SELECT 
  members.channel_id 
FROM 
  members 
INNER JOIN
  channels 
ON 
  channels.id = members.channel_id 
WHERE 
  channels.type = 'stranger'  
AND 
  (members.user_id = $1 OR members.user_id = $2) 
GROUP BY 
  members.channel_id 
HAVING 
  count(*) > 1 
