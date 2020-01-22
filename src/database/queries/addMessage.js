const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userId, content, upload },
  db = database
) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      messages (channel_id, user_id, content, upload)
    SELECT
      members.channel_id AS "channel_id",
      members.user_id AS "user_id",
      $3 AS "content",
      $4 AS "upload"
    FROM
      members
    WHERE
      members.channel_id = $1
      AND members.user_id = $2
    RETURNING
      id AS "id",
      channel_id AS "channelId",
      user_id AS "userId",
      content AS "content",
      upload AS "upload",
      created_at AS "createdAt"
      `,
        [channelId, userId, content, upload]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
