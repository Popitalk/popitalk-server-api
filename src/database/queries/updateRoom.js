const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ roomId, userId, name }, db = database) => {
  try {
    const query = knex
      .update({
        name,
        updated_at: knex.raw("NOW()")
      })
      .from("channels")
      .where("id", roomId)
      .whereExists(q =>
        q
          .select("*")
          .from("members")
          .where("channel_id", roomId)
          .andWhere("user_id", userId)
      )
      .returning([
        "id",
        "type",
        "name",
        "public",
        "owner_id AS ownerId",
        "created_at AS createdAt"
      ]);

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
