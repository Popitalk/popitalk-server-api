WITH psts AS (
  SELECT
    posts.id AS pid,
    posts.created_at AS pcreated_at,
    *
  FROM
    posts
  WHERE
    posts.channel_id = $1
    AND EXISTS (
      SELECT
        1
      FROM
        members
      WHERE
        members.channel_id = posts.channel_id
        AND members.user_id = $2
    )
  ORDER BY
    posts.created_at DESC
  LIMIT
    7
), psts_arr AS (
  SELECT
    COALESCE(ARRAY_AGG(psts.pid), ARRAY[]::UUID[]) AS ids
  FROM
    psts
), psts_obj AS (
  SELECT
    COALESCE(
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'id',
        psts.pid,
        'channelId',
        psts.channel_id,
        'userId',
        psts.user_id,
        'content',
        psts.content,
        'upload',
        psts.upload,
        'createdAt',
        psts.pcreated_at,
        'author',
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
            users.id = psts.user_id
        ),
        'liked',
        (
          CASE
            WHEN
              EXISTS (
                SELECT
                  1
                FROM
                  post_likes
                WHERE
                  post_likes.post_id = psts.pid
                  AND post_likes.user_id = $2
              )
            THEN
              TRUE
            ELSE
              FALSE
          END
        ),
        'likeCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            post_likes
          WHERE
            post_likes.post_id = psts.pid
        ),
        'commentCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
        ),
        'selfCommentCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
            AND comments.user_id = $2
        ),
        'firstCommentId',
        (
          SELECT
            comments.id
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
          ORDER BY
            comments.created_at ASC
          LIMIT
            1
        ),
        'lastCommentId',
        (
        SELECT
          comments.id
        FROM
          comments
        WHERE
          comments.post_id = psts.pid
        ORDER BY
          comments.created_at DESC
        LIMIT
          1
        ),
        'lastCommentAt',
        (
        SELECT
          comments.created_at
        FROM
          comments
        WHERE
          comments.post_id = psts.pid
        ORDER BY
          comments.created_at DESC
        LIMIT
          1
        )
      )
    ), ARRAY[]::JSON[]) AS "posts"
  FROM
    psts
), cmnts AS (
  SELECT
    JSON_AGG(c ORDER BY "createdAt" DESC) AS comments
  FROM (
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
      ) AS author,
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
                AND comment_likes.user_id = $2
            )
          THEN
            TRUE
          ELSE
            FALSE
        END
      ) AS liked,
      (
        SELECT
          COUNT(*)::SMALLINT
        FROM
          comment_likes
        WHERE
          comment_likes.comment_id = comments.id
      ) AS "likeCount"
    FROM
      comments, psts_arr
    WHERE
      comments.post_id = ANY (psts_arr.ids)
    ORDER BY
      comments.created_at DESC
    LIMIT
      3
  ) AS c
)
SELECT
  psts_obj.posts AS posts,
  COALESCE(cmnts.comments, '[]'::JSON) AS comments
FROM
  psts_obj, cmnts
