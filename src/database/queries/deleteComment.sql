
---CTE to get channelId
WITH deleted_comment (
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
          members
        WHERE
          members.channel_id = messages.channel_id
          AND members.user_id = $2
          AND members.admin = TRUE
      )
    )
  RETURNING
    id,
    channel_id AS "channelId"
)
SELECT
  deleted_comment.*
FROM
  deleted_comment
