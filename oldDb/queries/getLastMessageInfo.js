const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = m.channel_id
        ORDER BY
          messages.created_at ASC
        LIMIT
          1
      ) AS "firstMessageId",
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = m.channel_id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageId",
      (
        SELECT
          messages.created_at
        FROM
          messages
        WHERE
          messages.channel_id = m.channel_id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageAt"
    FROM
      messages AS m
    WHERE
      m.channel_id = $1
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
