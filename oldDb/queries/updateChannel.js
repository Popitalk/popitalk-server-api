/* eslint-disable no-nested-ternary */
const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userId, name, description, publicChannel, icon, removeIcon },
  db = database
) => {
  try {
    const query = knex
      .update({
        name,
        description:
          description === undefined
            ? undefined
            : description.length === 0
            ? null
            : description,
        public: publicChannel === undefined ? undefined : publicChannel,
        icon: removeIcon ? null : icon,
        updated_at: knex.raw("NOW()")
      })
      .from("channels")
      .where("id", channelId)
      .whereExists(q =>
        q
          .select("*")
          .from("members")
          .where("channel_id", channelId)
          .andWhere("user_id", userId)
          .andWhere("admin", true)
      )
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
