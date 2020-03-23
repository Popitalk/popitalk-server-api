const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    WITH cids AS (
      SELECT
        COALESCE(ARRAY_AGG(mem.channel_id), ARRAY[]::UUID[]) AS ids
      FROM
        members AS mem
      WHERE
        mem.user_id = $1
        AND NOT mem.banned
    )
    SELECT
      channels.id,
      channels.type
    FROM
      channels, cids
    WHERE
      channels.id = ANY (cids.ids)
      `,
        [userId]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
