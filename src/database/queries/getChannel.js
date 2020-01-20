const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      id,
      type,
      name,
      description,
      icon,
      public,
      owner_id AS "ownerId",
      created_at AS "createdAt",
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
      ) AS "users"
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
