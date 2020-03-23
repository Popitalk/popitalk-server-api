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
        fm.id AS "firstMessageId",
        lm.id AS "lastMessageId",
        lm.created_at AS "lastMessageAt",
        fp.id AS "firstPostId",
        lp.id AS "lastPostId",
        lp.created_at AS "lastPostAt",
        users.members,
        users.admins
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
            posts.id AS id
          FROM
            posts
          WHERE
            posts.channel_id = channels.id
          ORDER BY
            posts.created_at ASC
          LIMIT
            1
        ) fp ON TRUE
      LEFT JOIN LATERAL (
          SELECT
            posts.id AS id,
            posts.created_at AS created_at
          FROM
            posts
          WHERE
            posts.channel_id = channels.id
          ORDER BY
            posts.created_at DESC
          LIMIT
            1
        ) lp ON TRUE
      LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(members.user_id) FILTER (WHERE NOT banned) AS members,
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
