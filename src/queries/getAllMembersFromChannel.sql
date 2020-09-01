SELECT channel_id, user_id, admin, banned 
FROM members
WHERE channel_id = $1;