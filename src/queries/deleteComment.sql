WITH chan AS (
  SELECT
    posts.channel_id AS id
  FROM
    comments
  JOIN
    posts
  ON
    comments.post_id = posts.id
  WHERE
    comments.id = $1
), deleted_comment AS (
  DELETE FROM
    comments
  WHERE
    comments.id = $1
    AND (
      comments.user_id = $2
      OR EXISTS (
        SELECT
          1
        FROM
          members, chan
        WHERE
          members.channel_id = chan.id
          AND members.admin = TRUE
      )
    )
  RETURNING
    id,
    post_id AS "postId",
    (
      SELECT
        id
      FROM
        chan
    ) AS "channelId"
)
SELECT
  deleted_comment.*
FROM
  deleted_comment
