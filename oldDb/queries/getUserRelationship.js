const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ fromUser, toUser }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      first_user_id AS "firstUserId",
      second_user_id AS "secondUserId",
      type
    FROM
      user_relationships
    WHERE
      first_user_id = least($1, $2)::UUID
      AND second_user_id = greatest($1, $2)::UUID
      `,
        [fromUser, toUser]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
