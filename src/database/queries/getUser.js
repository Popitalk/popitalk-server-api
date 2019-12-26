const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { id, username, email, usernameOrEmail, withPassword },
  db = database
) => {
  try {
    const query = knex
      .select("id")
      .select("first_name AS firstName")
      .select("last_name AS lastName")
      .select("username")
      .select("date_of_birth AS dateOfBirth")
      .select("avatar")
      .select("email")
      .select("email_verified AS emailVerified")
      .select("created_at AS createdAt")
      .from("users");

    if (usernameOrEmail) {
      query
        .where("username", usernameOrEmail)
        .orWhere("email", usernameOrEmail);
    } else if (id) {
      query.where("id", id);
    } else if (username) {
      query.where("username", username);
    } else if (email) {
      query.where("email", email);
    }

    if (withPassword) {
      query.select("password");
    }

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
