const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      seen_messages (channel_id, user_id)
    SELECT
      members.channel_id AS "channel_id",
      members.user_id AS "user_id"
    FROM
      members
    WHERE
      members.channel_id = $1
      AND members.user_id = $2
    RETURNING
      channel_id AS "channelId",
      user_id AS "userId"
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
