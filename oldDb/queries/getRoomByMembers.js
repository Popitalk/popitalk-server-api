const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userIds }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      SELECT
        channel_id AS "channelId"
      FROM
        members
      GROUP BY
        channel_id
      HAVING
        array_agg(user_id) @> $1
        `,
        [userIds]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
