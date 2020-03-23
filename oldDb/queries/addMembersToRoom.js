const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userIds, roomUsers }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      INSERT INTO
        members (channel_id, user_id)
      SELECT
        $1,
        mem.ids
      FROM
        unnest($2::UUID[]) AS mem(ids)
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
                user_id = ANY ($3)
            )
          GROUP BY
            channel_id
          HAVING
            array_agg(user_id) <@ $3
            AND count(*) = cardinality($3)
        )
      RETURNING
        channel_id AS channelId,
        user_id AS userId
    `,
        [channelId, userIds, roomUsers]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
