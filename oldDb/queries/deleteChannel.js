const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      channels
    WHERE
      (
        type = 'channel'
        AND owner_id = $2
        AND id = $1
      )
      OR (
        type != 'channel'
        AND id = $1
      )
    RETURNING
      id AS "channelId"`,
        [channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
