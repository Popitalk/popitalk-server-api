const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ firstUserId, secondUserId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      user_relationships
    WHERE
      first_user_id = $1
      AND second_user_id = $2
    RETURNING
      1`,
        [firstUserId, secondUserId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
