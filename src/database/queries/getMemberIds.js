const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      user_id
    FROM
      members
    WHERE
      members.channel_id = $1
      `,
        [channelId]
      )
    ).rows;

    if (response.length === 0) return null;

    return response.map(user => user.user_id);
  } catch (error) {
    throw createDatabaseError(error);
  }
};
