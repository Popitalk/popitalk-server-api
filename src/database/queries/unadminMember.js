const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, fromUser, toUser }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    UPDATE
      members
    SET
      admin = FALSE,
      updated_at = NOW()
    WHERE
      channel_id = $1
      AND user_id = $3
      AND EXISTS (
        SELECT
          1
        FROM
          channels
        WHERE
          channels.id = $1
          AND channels.owner_id = $2
      )
    RETURNING
      channel_id AS "channelId",
      user_id AS "userId",
      admin,
      banned,
      created_at AS "createdAt"`,
        [channelId, fromUser, toUser]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
