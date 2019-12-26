const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { firstName, lastName, username, dateOfBirth, password, avatar, email },
  db = database
) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      users
        (
          first_name,
          last_name,
          username,
          date_of_birth,
          password,
          avatar,
          email
        )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id AS "id",
      first_name AS "firstName",
      last_name AS "lastName",
      username AS "username",
      date_of_birth AS "dateOfBirth",
      avatar AS "avatar",
      email AS "email",
      email_verified AS "emailVerified",
      created_at AS "createdAt"`,
        [firstName, lastName, username, dateOfBirth, password, avatar, email]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
