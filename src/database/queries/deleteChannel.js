const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      channels
    WHERE
      id = $1
    RETURNING
      id`,
        [channelId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
