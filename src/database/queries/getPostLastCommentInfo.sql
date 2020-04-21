WITH fc AS (
  SELECT
    comments.id
  FROM
    comments
  WHERE
    comments.post_id = $1
  ORDER BY
    comments.created_at ASC
  LIMIT
    1
), lc AS (
  SELECT
    comments.id,
    comments.created_at
  FROM
    comments
  WHERE
    comments.post_id = $1
  ORDER BY
    comments.created_at DESC
  LIMIT
    1
)
SELECT
  fc.id AS "firstCommentId",
  lc.id AS "lastCommentId",
  lc.created_at AS "lastCommentAt"
FROM
  fc, lc
