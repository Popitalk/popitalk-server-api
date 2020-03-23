const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
        SELECT
          COALESCE(JSON_AGG(members.user_id) FILTER (WHERE banned), '[]') AS banned
        FROM
          members
        WHERE
          members.channel_id = $1
      `,
        [channelId]
      )
    ).rows[0];

    if (!response) return null;

    return response.banned;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
