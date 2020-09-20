INSERT INTO
  messages (channel_id, user_id, content, upload)
SELECT
  id as "channel_id",
  $2 as "user_id",
  $3 AS "content",
  $4 AS "upload"
FROM
  channels
WHERE
  (id = $1 AND public = true)
  OR $1 IN
  (
  SELECT
    id
  FROM
    members
  WHERE
    channel_id = $1 AND members.user_id = $2
  )
RETURNING
  id AS "id",
  channel_id AS "channelId",
  user_id AS "userId",
  content AS "content",
  upload AS "upload",
  created_at AS "createdAt",
  (
    SELECT
      JSON_BUILD_OBJECT(
        'id',
        users.id,
        'username',
        users.username,
        'avatar',
        users.avatar
      )
    FROM
      users
    WHERE
      users.id = user_id
  ) AS author
