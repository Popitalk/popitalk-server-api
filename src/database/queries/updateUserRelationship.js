const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId1, userId2, type }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT update_user_relationship($1, $2, $3)`,
        [userId1, userId2, type]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
