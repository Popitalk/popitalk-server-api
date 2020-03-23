DELETE FROM
  posts
WHERE
  posts.id = $1
  AND EXISTS (
    SELECT
      1
    FROM
      members
    WHERE
      members.channel_id = posts.channel_id
      AND members.user_id = $2
      AND members.admin = TRUE
  )
RETURNING
  id,
  channel_id AS "channelId"
