const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ postId, userId, content }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      comments (post_id, user_id, content)
    SELECT
      posts.id AS "post_id",
      $2 AS "user_id",
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
            ) != 5
        END
      )
    RETURNING
      id AS "id",
      post_id AS "postId",
      user_id AS "userId",
      content AS "content",
      created_at AS "createdAt",
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
                members.user_id = $2
                AND members.admin = TRUE
          )
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
      ) AS "canComment"
      `,
        [postId, userId, content]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
