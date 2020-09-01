SELECT
  *
FROM
  (
    SELECT
      comments.id,
      comments.post_id AS "postId",
      comments.user_id AS "userId",
      comments.content,
      comments.created_at AS "createdAt",
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
          users.id = comments.user_id
      ) AS "author",
      (
        CASE
          WHEN
            EXISTS (
              SELECT
                1
              FROM
                comment_likes
              WHERE
                comment_likes.comment_id = comments.id
                AND comment_likes.user_id = members.user_id
            )
          THEN
            TRUE
          ELSE
            FALSE
        END
      ) AS "liked",
      (
        SELECT
          COUNT(*)
        FROM
          comment_likes
        WHERE
          comment_likes.comment_id = comments.id
      ) AS "likeCount"
    FROM
      comments
    JOIN
      posts
    ON
      posts.id = comments.post_id
    JOIN
      members
    ON
      members.channel_id = posts.channel_id
    WHERE
      comments.post_id = $1
      AND members.user_id = $2
    ORDER BY
      comments.created_at DESC
    LIMIT
      $3
  ) AS c
ORDER BY
  "createdAt" ASC
