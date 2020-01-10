const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userIds }, db = database) => {
  try {
    const query = knex
      .insert(
        userIds.map(userId => ({ channel_id: channelId, user_id: userId }))
      )
      .into("members")
      .returning([
        "channel_id AS channelId",
        "user_id AS userId",
        "created_at AS createdAt"
      ]);

    const response = (await db.query(query.toString())).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
