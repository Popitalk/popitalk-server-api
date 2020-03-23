const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  {
    userId,
    firstName,
    lastName,
    dateOfBirth,
    email,
    password,
    avatar,
    removeAvatar
  },
  db = database
) => {
  try {
    const query = knex
      .update({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        email,
        email_verified: email ? false : undefined,
        avatar: removeAvatar ? null : avatar,
        password,
        updated_at: knex.raw("NOW()")
      })
      .from("users")
      .where("id", userId)
      .returning([
        "id",
        "first_name AS firstName",
        "last_name AS lastName",
        "username",
        "date_of_birth AS dateOfBirth",
        "avatar",
        "email",
        "email_verified AS emailVerified",
        "created_at AS createdAt"
      ]);

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
