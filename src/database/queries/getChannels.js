const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
        SELECT
          JSON_OBJECT_AGG(
            channels.id,
            JSON_BUILD_OBJECT(
              'type',
              channels.type,
              'name',
              channels.name,
              'description',
              channels.description,
              'icon',
              channels.icon,
              'public',
              channels.public,
              'ownerId',
              channels.owner_id,
              'createdAt',
              channels.created_at,
              'firstMessageId',
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
              ),
              'lastMessageId',
              (
                SELECT
                  messages.id
                FROM
                  messages
                WHERE
                  messages.channel_id = channels.id
                ORDER BY
                  messages.created_at DESC
                LIMIT
                  1
              ),
              'lastMessageAt',
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
              ),
              'lastMessage',
              (
                SELECT
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'content', messages.content,
                      'username', u.username
                    )
                  )
                FROM
                  messages
                LEFT JOIN LATERAL (
                  SELECT
                    users.username AS username
                  FROM
                    users
                  WHERE
                    users.id = messages.user_id
                  LIMIT
                    1
                ) u ON TRUE
                WHERE
                  messages.channel_id = channels.id
                GROUP BY
                  messages.created_at
                ORDER BY
                  messages.created_at DESC
                LIMIT
                  1
              ),
              'members',
              (
                CASE
                  WHEN
                    channels.type != 'channel'
                  THEN
                    (
                      SELECT
                        JSON_OBJECT_AGG(
                          u.id,
                          u.info
                        )
                      FROM
                      (SELECT
                         users.id,
                         JSON_BUILD_OBJECT(
                           'username',
                           users.username,
                           'firstName',
                           users.first_name,
                           'lastName',
                           users.last_name,
                           'avatar',
                           users.avatar
                         ) AS info,
                        users.username
                      FROM
                        users
                      JOIN
                        members AS mem2
                      ON
                        mem2.channel_id = channels.id
                        AND mem2.user_id = users.id
                      ORDER BY
                        users.username
                      LIMIT
                        4
                      ) AS u
                    )
                  ELSE
                    NULL
                END
              )
            )
          ) AS channels
        FROM
          channels
        JOIN
          members
        ON
          channels.id = members.channel_id
          AND members.user_id = $1
      `,
        [userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    console.error(error);
    throw createDatabaseError(error);
  }
};
