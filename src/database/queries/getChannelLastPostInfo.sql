SELECT
  fp.id AS "firstPostId",
  lp.id AS "lastPostId",
  lp.created_at AS "lastPostAt"
FROM
  messages AS m
LEFT JOIN LATERAL (
    SELECT
      posts.id
    FROM
      posts
    WHERE
      posts.channel_id = p.channel_id
    ORDER BY
      posts.created_at ASC
    LIMIT
      1
) fp ON TRUE
LEFT JOIN LATERAL (
    SELECT
      posts.id,
      posts.created_at
    FROM
      posts
    WHERE
      posts.channel_id = p.channel_id
    ORDER BY
      posts.created_at DESC
    LIMIT
      1
) lp ON TRUE
WHERE
  p.channel_id = $1
