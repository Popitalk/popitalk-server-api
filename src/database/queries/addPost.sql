INSERT INTO
  posts (channel_id, user_id, content, upload)
SELECT
  members.channel_id AS "channel_id",
  members.user_id AS "user_id",
  $3 AS "content",
  $4 AS "upload"
FROM
  members
WHERE
  members.channel_id = $1
  AND members.user_id = $2
  AND members.admin = TRUE
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
  ) AS author,
  0 AS "commentCount",
  0 AS "likeCount",
  FALSE AS "liked",
  0 AS "selfCommentCount"
