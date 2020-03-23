const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      SELECT
        channels.id,
        channels.type,
        channels.name,
        channels.description,
        channels.icon,
        channels.public,
        channels.owner_id AS "ownerId",
        channels.created_at AS "createdAt",
        users.member_count AS "memberCount",
        users.admins
      FROM
        channels
      LEFT JOIN LATERAL (
          SELECT
            COUNT(members.user_id) FILTER (WHERE NOT banned) AS member_count,
            JSON_AGG(members.user_id) FILTER (WHERE admin) AS admins
          FROM
            members
          WHERE
            members.channel_id = channels.id
        ) users ON TRUE
      WHERE
        channels.id = $1
      `,
        [channelId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
