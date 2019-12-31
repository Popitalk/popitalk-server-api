const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ username }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      users.id,
      users.username,
      users.first_name AS "firstName",
      users.last_name AS "lastName",
      users.avatar
    FROM
      users
    WHERE
      users.username % $1
      AND users.deleted_at IS NULL
    ORDER BY
      users.username <-> $1 ASC
    LIMIT
      9
      `,
        [username]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
