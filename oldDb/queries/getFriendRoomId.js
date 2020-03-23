const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId1, userId2 }, db = database) => {
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
        COUNT(*) = 2
        AND array_agg(user_id) @> ARRAY[$1::UUID, $2::UUID];
        `,
        [userId1, userId2]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
