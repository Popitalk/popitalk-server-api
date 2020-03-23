SELECT
  fm.id AS "firstMessageId",
  lm.id AS "lastMessageId",
  lm.created_at AS "lastMessageAt"
FROM
  messages AS m
LEFT JOIN LATERAL (
    SELECT
      messages.id
    FROM
      messages
    WHERE
      messages.channel_id = m.channel_id
    ORDER BY
      messages.created_at ASC
    LIMIT
      1
) fm ON TRUE
LEFT JOIN LATERAL (
    SELECT
      messages.id,
      messages.created_at
    FROM
      messages
    WHERE
      messages.channel_id = m.channel_id
    ORDER BY
      messages.created_at DESC
    LIMIT
      1
) lm ON TRUE
WHERE
  m.channel_id = $1
