const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      SELECT
        channels.type,
        channels.public AS "isPublic",
        COALESCE(NOT(mem.banned), FALSE) AS "isMember",
        COALESCE(mem.admin, FALSE) AS "isAdmin",
        COALESCE(mem.banned, FALSE) AS "isBanned"
      FROM
        channels
      LEFT JOIN LATERAL (
        SELECT
          members.admin,
          members.banned
        FROM
          members
        WHERE
          members.channel_id = channels.id
          AND members.user_id = $2
      ) mem ON TRUE
      WHERE
        channels.id = $1
      `,
        [channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
