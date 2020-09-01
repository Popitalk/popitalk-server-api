WITH fm AS (
    SELECT
      messages.id AS "firstMessageId"
    FROM
      messages
    WHERE
      messages.channel_id = $1
    ORDER BY
      messages.created_at ASC
    LIMIT
      1
), lm AS (
    SELECT
      messages.id AS "lastMessageId",
      messages.created_at AS "lastMessageAt"
    FROM
      messages
    WHERE
      messages.channel_id = $1
    ORDER BY
      messages.created_at DESC
    LIMIT
      1
)
SELECT
  *
FROM
  fm, lm
