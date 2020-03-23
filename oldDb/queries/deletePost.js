const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ postId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      posts
    WHERE
      posts.id = $1
      AND EXISTS (
        SELECT
          1
        FROM
          members
        WHERE
          members.channel_id = posts.channel_id
          AND members.user_id = $2
          AND members.admin = TRUE
      )
    RETURNING
      id,
      channel_id AS "channelId"
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
