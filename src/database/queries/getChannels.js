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
              'users',
              (
                CASE
                  WHEN
                    channels.type = 'room'
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
