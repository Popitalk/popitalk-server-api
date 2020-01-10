const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { type, name, description, icon, public, ownerId },
  db = database
) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      channels
        (
          type,
          name,
          description,
          icon,
          public,
          owner_id
        )
    VALUES
      ($1, $2, $3, $4, COALESCE ($5, FALSE), $6)
    RETURNING
      id,
      type,
      name,
      description,
      icon,
      public,
      owner_id AS "ownerId",
      created_at AS "createdAt"`,
        [type, name, description, icon, public, ownerId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
