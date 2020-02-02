const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ postId, userId, limit = 3 }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
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
              users.id = members.user_id
          ) AS "author"
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
      `,
        [postId, userId, limit]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
