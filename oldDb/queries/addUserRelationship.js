const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ fromUser, toUser, type }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
      INSERT INTO
        user_relationships
      VALUES(
        least($1, $2)::UUID,
        greatest($1, $2)::UUID,
        CASE
          WHEN
            $1 < $2
            AND $3 = 'friend'
          THEN
            'friend_first_second'
          WHEN
            $1 > $2
            AND $3 = 'friend'
          THEN
            'friend_second_first'
          WHEN
            $1 < $2
            AND $3 = 'block'
          THEN
            'block_first_second'
          ELSE
            'friend_second_first'
        END
      )`,
        [fromUser, toUser, type]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
