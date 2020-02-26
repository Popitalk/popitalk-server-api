const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      members
        (channel_id, user_id)
    VALUES
      ($1, $2)
    RETURNING
      channel_id AS "channelId",
      user_id AS "userId",
      created_at AS "createdAt",
      (
        SELECT
          JSON_BUILD_OBJECT(
            'username',
            users.username,
            'firstName',
            users.first_name,
            'lastName',
            users.last_name,
            'avatar',
            users.avatar
          )
        FROM
          users
        WHERE
          users.id = user_id
      ) AS user
      `,
        [channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
