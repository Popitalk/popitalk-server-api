const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      SELECT
        posts.id,
        posts.channel_id AS "channelId",
        posts.user_id AS "userId",
        posts.content,
        posts.created_at AS "createdAt",
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
            users.id = posts.user_id
        ) AS "author",
        (
          SELECT
            COUNT(*)
          FROM
            post_likes
          WHERE
            post_likes.post_id = posts.id
        ) AS "likeCount",
        (
          SELECT
            COUNT(*)
          FROM
            comments
          WHERE
            comments.post_id = posts.id
        ) AS "commentCount",
        (
          SELECT
            comments.id
          FROM
            comments
          WHERE
            comments.post_id = posts.id
          ORDER BY
            comments.created_at ASC
          LIMIT
            1
        ) AS "firstCommentId",
        (
          SELECT
            comments.id
          FROM
            comments
          WHERE
            comments.post_id = posts.id
          ORDER BY
            comments.created_at DESC
          LIMIT
            1
        ) AS "lastCommentId",
        (
          CASE
            WHEN
              EXISTS (
                SELECT
                  1
                FROM
                  post_likes
                WHERE
                  post_likes.post_id = posts.id
                  AND post_likes.user_id = $2
              )
            THEN
              TRUE
            ELSE
              FALSE
          END
        ) AS "liked",
        COALESCE((
          SELECT
            JSON_AGG(c ORDER BY "createdAt" ASC)
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
                SELECT
                  COUNT(*)
                FROM
                  comment_likes
                WHERE
                  comment_likes.comment_id = comments.id
              ) AS "likeCount",
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
              ) AS "liked"
            FROM
              comments
            WHERE
              comments.post_id = posts.id
            ORDER BY
              comments.created_at DESC
            LIMIT
              3
          ) AS c
        ), '[]') AS comments
      FROM
        posts
      WHERE
        posts.channel_id = $1
      ORDER BY
        posts.created_at DESC
      LIMIT
        7
      `,
        [channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
