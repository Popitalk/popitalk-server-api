const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId, content }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      posts (channel_id, user_id, content)
    SELECT
      members.channel_id AS "channel_id",
      members.user_id AS "user_id",
      $3 AS "content"
    FROM
      members
    WHERE
      members.channel_id = $1
      AND members.user_id = $2
      AND members.admin = TRUE
    RETURNING
      id AS "id",
      channel_id AS "channelId",
      user_id AS "userId",
      content AS "content",
      created_at AS "createdAt"
      `,
        [channelId, userId, content]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
