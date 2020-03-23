const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      SELECT
        ur.first_user_id AS "firstUserId",
        ur.second_user_id AS "secondUserId",
        ur.type,
        ur.created_at AS "createdAt",
        JSON_BUILD_OBJECT(
          'username',
          u.username,
          'firstName',
          u.first_name,
          'lastName',
          u.last_name,
          'avatar',
          u.avatar
        ) AS "userInfo"
      FROM
        user_relationships AS ur,
        users AS u
      WHERE
        (ur.first_user_id = $1
        OR ur.second_user_id = $1)
        AND u.id = (
          CASE
            WHEN
            ur.first_user_id = $1
            THEN
            ur.second_user_id
            ELSE
            ur.first_user_id
          END
        )
        AND u.deleted_at IS NULL`,
        [userId]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
