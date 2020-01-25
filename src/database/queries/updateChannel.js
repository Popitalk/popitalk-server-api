const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, ownerId, icon, removeIcon },
  db = database
) => {
  try {
    const query = knex
      .update({
        icon: removeIcon ? null : icon,
        updated_at: knex.raw("NOW()")
      })
      .from("channels")
      .where("id", channelId)
      .andWhere("owner_id", ownerId)
      // .whereExists(q =>
      //   q
      //     .select("*")
      //     .from("members")
      //     .where("channel_id", roomId)
      //     .andWhere("user_id", userId)
      // )
      .returning([
        "id",
        "type",
        "name",
        "description",
        "icon",
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
