const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
        SELECT
          users.id,
          users.first_name AS "firstName",
          users.last_name AS "lastName",
          users.username AS "username",
          users.date_of_birth AS "dateOfBirth",
          users.avatar AS "avatar",
          users.email AS "email",
          users.email_verified AS "emailVerified",
          users.created_at AS "createdAt",
          ur.relationships AS "relationships"
        FROM
          users
          LEFT JOIN LATERAL (
            SELECT
              JSON_BUILD_OBJECT(
                'friends',
                COALESCE(JSONB_AGG(
                  COALESCE(
                    NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
                  ) FILTER (WHERE type = 'friend_both'), '[]'),
                'sentFriendRequests',
                COALESCE(JSONB_AGG(ur.second_user_id) FILTER
                (WHERE type = 'friend_first_second' AND ur.first_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(ur.first_user_id) FILTER
                (WHERE type = 'friend_second_first' AND ur.second_user_id = users.id), '[]'),
                'receivedFriendRequests',
                COALESCE(JSONB_AGG(ur.first_user_id) FILTER
                (WHERE type = 'friend_first_second' AND ur.second_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(ur.second_user_id) FILTER
                (WHERE type = 'friend_second_first' AND ur.first_user_id = users.id), '[]'),
                'blocked',
                COALESCE(JSONB_AGG(ur.second_user_id) FILTER
                (WHERE type = 'block_first_second' AND ur.first_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(ur.first_user_id) FILTER
                (WHERE type = 'block_second_first' AND ur.second_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(
                  COALESCE(
                    NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
                  ) FILTER (WHERE type = 'block_both'), '[]'),
                'blockers',
                COALESCE(JSONB_AGG(ur.first_user_id) FILTER
                (WHERE type = 'block_first_second' AND ur.second_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(ur.second_user_id) FILTER
                (WHERE type = 'block_second_first' AND ur.first_user_id = users.id), '[]') ||
                COALESCE(JSONB_AGG(
                  COALESCE(
                    NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
                  ) FILTER (WHERE type = 'block_both'), '[]')
              ) AS relationships
            FROM
              user_relationships AS ur
            WHERE
              ur.first_user_id = users.id
              OR ur.second_user_id = users.id
          ) ur ON TRUE
        WHERE
          users.id = $1
          AND users.deleted_at IS NULL
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

// LEFT JOIN LATERAL (
//   SELECT
//     JSON_AGG(members.channel_id) AS channel_ids,
//     JSON_AGG(members.user_id) FILTER (WHERE )AS channel_ids,
//   FROM
//     members
//   WHERE
//     members.user_id = users.id
//     AND NOT members.banned
// ) mem ON TRUE

// LEFT JOIN LATERAL (
//   SELECT
//     JSON_AGG(users.id) AS user_ids
//   FROM
//     members
//   JOIN
//     users
//   ON
//     members.user_id = users.id
//   WHERE
//     members.channel_id
//     members.user_id = users.id
//     AND NOT members.banned
// ) usrs ON TRUE
