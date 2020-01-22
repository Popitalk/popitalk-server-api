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
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at ASC
        LIMIT
          1
      ) AS "firstMessageId",
      (
        SELECT
          messages.created_at
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageAt",
      (
        SELECT
          JSON_OBJECT_AGG(
            users.id,
            JSON_BUILD_OBJECT(
              'firstName',
              users.first_name,
              'lastName',
              users.last_name,
              'username',
              users.username,
              'avatar',
              users.avatar
            )
          )
        FROM
          users
        JOIN
          members
        ON
          members.channel_id = channels.id
          AND members.user_id = users.id
      ) AS "users",
      COALESCE((
        SELECT
          JSON_AGG(m ORDER BY "createdAt")
        FROM
        (
          SELECT
            messages.id,
            messages.user_id AS "userId",
            messages.content,
            messages.upload,
            messages.created_at AS "createdAt",
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'id',
                  users.id,
                  'username',
                  users.username,
                  'avatar',
                  users.avatar
                )
              FROM
                users
              WHERE
                users.id = messages.user_id
            ) AS "author"
          FROM
            messages
          WHERE
            messages.channel_id = channels.id
          ORDER BY
            messages.created_at DESC
          LIMIT
            50
        ) AS m
      ), '[]') AS messages
    FROM
      channels
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
