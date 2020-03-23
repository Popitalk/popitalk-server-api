DELETE FROM
  comment_likes
WHERE
  comment_id = $1
  AND user_id = $2
RETURNING
  comment_id AS "commentId",
  user_id AS "userId",
  (
    SELECT
      comments.post_id
    FROM
      comments
    WHERE
      comments.id = $1
  ) AS "postId",
  (
    SELECT
      posts.channel_id
    FROM
      comments
    JOIN
      posts
    ON
      posts.id = comments.post_id
    WHERE
      comments.id = $1
  ) AS "channelId"
