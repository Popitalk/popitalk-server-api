INSERT INTO
  comment_likes (comment_id, user_id)
SELECT
  comments.id AS "post_id",
  members.user_id AS "user_id"
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
  comments.id = $1
  AND members.user_id = $2
RETURNING
  comment_id AS "commentId",
  user_id AS "userId",
  created_at AS "createdAt",
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
