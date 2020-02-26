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
        channels.public,
        channels.created_at AS "createdAt",
        fm.id AS "firstMessageId",
        lm.id AS "lastMessageId",
        lm.created_at AS "lastMessageAt",
        users.members
      FROM
        channels
      LEFT JOIN LATERAL (
          SELECT
            messages.id AS id
          FROM
            messages
          WHERE
            messages.channel_id = channels.id
          ORDER BY
            messages.created_at ASC
          LIMIT
            1
        ) fm ON TRUE
      LEFT JOIN LATERAL (
          SELECT
            messages.id AS id,
            messages.created_at AS created_at
          FROM
            messages
          WHERE
            messages.channel_id = channels.id
          ORDER BY
            messages.created_at DESC
          LIMIT
            1
        ) lm ON TRUE
      LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(members.user_id) AS members
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
