const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ firstUserId, secondUserId, type }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      UPDATE
        user_relationships
      SET
        type = $3,
        updated_at = NOW()
      WHERE
        first_user_id = $1
        AND second_user_id = $2`,
        [firstUserId, secondUserId, type]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
