const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ postId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      post_likes
    WHERE
      post_id = $1
      AND user_id = $2
    RETURNING
      post_id AS "postId",
      user_id AS "userId",
      (
        SELECT
          posts.channel_id
        FROM
          posts
        WHERE
          posts.id = $1
      ) AS "channelId"
    `,
        [postId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
