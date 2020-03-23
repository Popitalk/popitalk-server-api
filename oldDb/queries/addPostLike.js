const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ postId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      post_likes (post_id, user_id)
    SELECT
      posts.id AS "post_id",
      members.user_id AS "user_id"
    FROM
      posts
    JOIN
      members
    ON
      members.channel_id = posts.channel_id
    WHERE
      posts.id = $1
      AND members.user_id = $2
    RETURNING
      post_id AS "postId",
      user_id AS "userId",
      created_at AS "createdAt",
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
