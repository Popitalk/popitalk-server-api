const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userIds }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      INSERT INTO
        channels (type)
      SELECT
        'group'
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            members
          WHERE
            channel_id IN (
              SELECT
                channel_id
              FROM
                members
              WHERE
                user_id = ANY ($1)
            )
          GROUP BY
            channel_id
          HAVING
            array_agg(user_id) <@ $1
            AND count(*) = cardinality($1)
        )
      RETURNING
        id,
        type,
        name,
        description,
        icon,
        public,
        owner_id AS "ownerId",
        created_at AS "createdAt"
    `,
        [userIds]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
