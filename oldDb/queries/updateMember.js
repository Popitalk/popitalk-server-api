const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, fromUser, toUser, admin, ban },
  db = database
) => {
  try {
    const query = knex
      .update({
        admin,
        ban,
        updated_at: knex.raw("NOW()")
      })
      .from("members")
      .where("channel_id", channelId)
      .andWhere("user_id", toUser)
      .whereExists(q =>
        q
          .select("*")
          .from("members")
          .where("channel_id", channelId)
          .andWhere("user_id", fromUser)
          .andWhere("admin", true)
      )
      .whereNotExists(q =>
        q
          .select("*")
          .from("channels")
          .where("id", channelId)
          .andWhere("owner_id", toUser)
      )
      .returning([
        "channel_id AS channelId",
        "user_id AS userId",
        "admin",
        "banned",
        "created_at AS createdAt"
      ]);

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
