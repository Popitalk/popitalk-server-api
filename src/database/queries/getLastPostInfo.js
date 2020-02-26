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
          posts.id
        FROM
          posts
        WHERE
          posts.channel_id = p.channel_id
        ORDER BY
          posts.created_at ASC
        LIMIT
          1
      ) AS "firstPostId",
      (
        SELECT
          posts.id
        FROM
          posts
        WHERE
          posts.channel_id = p.channel_id
        ORDER BY
          posts.created_at DESC
        LIMIT
          1
      ) AS "lastPostId",
      (
        SELECT
          posts.created_at
        FROM
          posts
        WHERE
          posts.channel_id = p.channel_id
        ORDER BY
          posts.created_at DESC
        LIMIT
          1
      ) AS "lastPostAt"
    FROM
      posts AS p
    WHERE
      p.channel_id = $1
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
