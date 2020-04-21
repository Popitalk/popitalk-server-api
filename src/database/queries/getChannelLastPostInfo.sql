WITH fp AS (
  SELECT
    posts.id
  FROM
    posts
  WHERE
    posts.channel_id = $1
  ORDER BY
    posts.created_at ASC
  LIMIT
    1
), lp AS (
  SELECT
    posts.id,
    posts.created_at
  FROM
    posts
  WHERE
    posts.channel_id = $1
  ORDER BY
    posts.created_at DESC
  LIMIT
    1
)
SELECT
  fp.id AS "firstPostId",
  lp.id AS "lastPostId",
  lp.created_at AS "lastPostAt"
FROM
  fp, lp
