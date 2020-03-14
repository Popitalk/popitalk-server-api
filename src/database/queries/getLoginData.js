const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
        WITH self AS (
          SELECT
            *
          FROM
            users
          WHERE
            users.id = $1
            AND users.deleted_at IS NULL
        ), chans AS (
           SELECT
             members.channel_id,
             members.admin
           FROM
             members, self
           WHERE
             members.user_id = self.id
             AND NOT members.banned
         ), channels AS (
          SELECT
            channels.id,
            channels.type,
            channels.name,
            channels.description,
            channels.icon,
            channels.public,
            (
              SELECT
                ARRAY_AGG(members.user_id)
              FROM
                members
              WHERE
                channels.id = members.channel_id
            ) AS members
          FROM
            channels
          JOIN
            chans
          ON
            channels.id = chans.channel_id
        ), channels_agg AS (
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
                'members',
                channels.members
              )
            ) AS channels
          FROM
            channels
        )
        SELECT
          self.id,
          self.first_name AS "firstName",
          self.last_name AS "lastName",
          self.username AS "username",
          self.date_of_birth AS "dateOfBirth",
          self.avatar AS "avatar",
          self.email AS "email",
          self.email_verified AS "emailVerified",
          self.created_at AS "createdAt",
          channels_agg.channels
        FROM
          self, channels_agg
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
// const database = require("../../config/database");
// const createDatabaseError = require("../../helpers/createDatabaseError");

// module.exports = async ({ userId }, db = database) => {
//   try {
//     const response = (
//       await db.query(
//         /* SQL */ `
//         SELECT
//           users.id,
//           users.first_name AS "firstName",
//           users.last_name AS "lastName",
//           users.username AS "username",
//           users.date_of_birth AS "dateOfBirth",
//           users.avatar AS "avatar",
//           users.email AS "email",
//           users.email_verified AS "emailVerified",
//           users.created_at AS "createdAt",
//           ur.relationships AS "relationships"
//           --cids.channel_ids AS "channelIds",
//           --channels.chans AS "channels",
//           --uids.user_ids AS "uids"
//           --users2.usrs2 AS "users"
//         FROM
//           users
//         LEFT JOIN LATERAL (
//           SELECT
//             JSONB_BUILD_OBJECT(
//               'friends',
//               COALESCE(JSONB_AGG(
//                 COALESCE(
//                   NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
//                 ) FILTER (WHERE type = 'friend_both'), '[]'),
//               'sentFriendRequests',
//               COALESCE(JSONB_AGG(ur.second_user_id) FILTER
//               (WHERE type = 'friend_first_second' AND ur.first_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(ur.first_user_id) FILTER
//               (WHERE type = 'friend_second_first' AND ur.second_user_id = users.id), '[]'),
//               'receivedFriendRequests',
//               COALESCE(JSONB_AGG(ur.first_user_id) FILTER
//               (WHERE type = 'friend_first_second' AND ur.second_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(ur.second_user_id) FILTER
//               (WHERE type = 'friend_second_first' AND ur.first_user_id = users.id), '[]'),
//               'blocked',
//               COALESCE(JSONB_AGG(ur.second_user_id) FILTER
//               (WHERE type = 'block_first_second' AND ur.first_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(ur.first_user_id) FILTER
//               (WHERE type = 'block_second_first' AND ur.second_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(
//                 COALESCE(
//                   NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
//                 ) FILTER (WHERE type = 'block_both'), '[]'),
//               'blockers',
//               COALESCE(JSONB_AGG(ur.first_user_id) FILTER
//               (WHERE type = 'block_first_second' AND ur.second_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(ur.second_user_id) FILTER
//               (WHERE type = 'block_second_first' AND ur.first_user_id = users.id), '[]') ||
//               COALESCE(JSONB_AGG(
//                 COALESCE(
//                   NULLIF(ur.first_user_id, users.id), NULLIF(ur.second_user_id, users.id))
//                 ) FILTER (WHERE type = 'block_both'), '[]')
//             ) AS relationships
//           FROM
//             user_relationships AS ur
//           WHERE
//             ur.first_user_id = users.id
//             OR ur.second_user_id = users.id
//           ) ur ON TRUE
//         LEFT JOIN LATERAL (
//           SELECT
//             ARRAY_AGG(members.channel_id) AS channel_ids
//           FROM
//             members
//           WHERE
//             members.user_id = users.id
//         ) cids ON TRUE
//         LEFT JOIN LATERAL (
//           SELECT
//             JSON_OBJECT_AGG(
//               channels.id,
//               JSON_BUILD_OBJECT(
//                 'type',
//                 channels.type,
//                 'name',
//                 channels.name,
//                 'description',
//                 channels.description,
//                 'icon',
//                 channels.icon,
//                 'public',
//                 channels.public,
//                 'ownerId',
//                 channels.owner_id,
//                 'members',
//                 (
//                   SELECT
//                     JSON_AGG(members.user_id) FILTER (WHERE NOT banned)
//                   FROM
//                     members
//                   WHERE
//                     members.channel_id = channels.id
//                 )
//               )
//             ) AS chans
//           FROM
//             channels
//           WHERE
//             channels.id = ANY (cids.channel_ids)
//         ) channels ON TRUE
//         LEFT JOIN LATERAL (
//               SELECT
//                 anyarray_uniq(
//                   usrs.channel_users::JSONB[] ||
//                   usrs.relationships_users::JSONB[]
//                 ) AS user_ids
//               FROM (
//                 SELECT
//                   ARRAY_AGG(u1.ids) as channel_users,
//                   ARRAY_AGG(u2.ids) AS relationships_users
//                 FROM
//                 (
//                   SELECT
//                     json_array_elements(value::JSON->'members') AS ids
//                   FROM
//                     JSON_EACH(channels.chans)
//                 ) u1
//                 LEFT JOIN LATERAL (
//                   SELECT
//                     jsonb_array_elements(
//                       COALESCE(ur.relationships::JSONB->'friends', '[]') ||
//                       COALESCE(ur.relationships::JSONB->'sentFriendRequests', '[]') ||
//                       COALESCE(ur.relationships::JSONB->'receivedFriendRequests', '[]') ||
//                       COALESCE(ur.relationships::JSONB->'blocked', '[]') ||
//                       COALESCE(ur.relationships::JSONB->'blockers', '[]')
//                     )
//                       AS ids
//                 ) u2 ON TRUE
//               ) usrs
//         ) uids ON TRUE

//         WHERE
//           users.id = $1
//           AND users.deleted_at IS NULL
//       `,
//         [userId]
//       )
//     ).rows[0];

//     if (!response) return null;

//     return response;
//   } catch (error) {
//     console.error(error);
//     throw createDatabaseError(error);
//   }
// };

// // LEFT JOIN LATERAL (
// //   SELECT
// //     JSON_AGG(members.channel_id) AS channel_ids,
// //     JSON_AGG(members.user_id) FILTER (WHERE )AS channel_ids,
// //   FROM
// //     members
// //   WHERE
// //     members.user_id = users.id
// //     AND NOT members.banned
// // ) mem ON TRUE

// // LEFT JOIN LATERAL (
// //   SELECT
// //     JSON_AGG(users.id) AS user_ids
// //   FROM
// //     members
// //   JOIN
// //     users
// //   ON
// //     members.user_id = users.id
// //   WHERE
// //     members.channel_id
// //     members.user_id = users.id
// //     AND NOT members.banned
// // ) usrs ON TRUE
