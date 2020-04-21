INSERT INTO
  comments (post_id, user_id, content)
SELECT
  posts.id AS "post_id",
  members.user_id AS "user_id",
  $3 AS "content"
FROM
  posts
JOIN
  members
ON
  members.channel_id = posts.channel_id
WHERE
  posts.id = $1
  AND members.user_id = $2
  AND (
    CASE
      WHEN
        members.admin = TRUE
      THEN
        TRUE
      ELSE
        (
          SELECT
            COUNT(*)
          FROM
            (
              SELECT
                comments.user_id
              FROM
                comments
              WHERE
                comments.post_id = $1
              ORDER BY
                comments.created_at DESC
              LIMIT
                5
            ) AS cuid
          WHERE
            cuid.user_id = $2
        ) < 5
    END
  )
RETURNING
  id AS "id",
  post_id AS "postId",
  user_id AS "userId",
  content AS "content",
  created_at AS "createdAt",
  (
    SELECT
      posts.channel_id
    FROM
      posts
    WHERE
      posts.id = post_id
  ) AS "channelId",
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
  0 AS "likeCount",
  FALSE AS "liked",
  (
    CASE
      WHEN
        EXISTS (
          SELECT
            1
          FROM
            posts
          JOIN
            members
          ON
            members.channel_id = posts.channel_id
          WHERE
            posts.id = $1
            AND members.user_id = $2
            AND members.admin
        )
      THEN
        0
      ELSE (
        SELECT
          COUNT(*)::SMALLINT + 1
        FROM
          comments
        WHERE
          comments.post_id = $1
          AND comments.user_id = $2
      )
    END
  ) AS "selfCommentCount"
