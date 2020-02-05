const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userIds, admin = false },
  db = database
) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      members (channel_id, user_id, admin)
    SELECT
      $1 AS "channel_id",
      mem.id AS "user_id",
      $3 AS "admin"
    FROM
      unnest($2::UUID[]) AS mem(id)
    RETURNING
      channel_id AS "channelId",
      user_id AS "userId",
      admin,
      created_at AS "createdAt"
      `,
        [channelId, userIds, admin]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
