const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ messageId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      messages
    WHERE
      messages.id = $1
      AND (
        messages.user_id = $2
        OR EXISTS (
          SELECT
            1
          FROM
            admins
          WHERE
            admins.channel_id = messages.channel_id
            AND admins.user_id = $2
        )
      )
    RETURNING
      id`,
        [messageId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
