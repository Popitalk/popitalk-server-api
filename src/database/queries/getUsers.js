const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userIds }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      JSON_OBJECT_AGG(
        users.id,
        JSON_BUILD_OBJECT(
          'firstName',
          users.first_name,
          'lastName',
          users.last_name,
          'username',
          users.username,
          'avatar',
          users.avatar
        )
      ) AS users
    FROM
      users
    WHERE
      users.id = ANY ($1)
      `,
        [userIds]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
