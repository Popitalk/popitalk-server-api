const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    UPDATE
      users
    SET
      deleted_at = NOW()
    WHERE
      id = $1
    RETURNING
      id`,
        [userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
