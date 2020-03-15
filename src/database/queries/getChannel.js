const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      channels.id,
      channels.type,
      channels.name,
      channels.description,
      channels.icon,
      channels.public,
      channels.owner_id AS "ownerId",
      channels.created_at AS "createdAt",
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at ASC
        LIMIT
          1
      ) AS "firstMessageId",
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageId",
      (
        SELECT
          messages.created_at
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageAt",
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
      ) AS "users",
      COALESCE((
        SELECT
          JSON_AGG(m ORDER BY "createdAt")
        FROM
        (
          SELECT
            messages.id,
            messages.user_id AS "userId",
            messages.content,
            messages.upload,
            messages.created_at AS "createdAt",
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'id',
                  users.id,
                  'username',
                  users.username,
                  'avatar',
                  users.avatar
                )
              FROM
                users
              WHERE
                users.id = messages.user_id
            ) AS "author"
          FROM
            messages
          WHERE
            messages.channel_id = channels.id
          ORDER BY
            messages.created_at DESC
          LIMIT
            50
        ) AS m
      ), '[]') AS "messages",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              COALESCE((
                SELECT
                  JSON_AGG(members.user_id)
                FROM
                  members
                WHERE
                  members.channel_id = channels.id
                  AND members.admin = TRUE
              ), '[]')
            )
          ELSE
            NULL
        END
      ) "admins",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              COALESCE((
                SELECT
                  JSON_AGG(members.user_id)
                FROM
                  members
                WHERE
                  members.channel_id = channels.id
                  AND members.banned = TRUE
              ), '[]')
            )
          ELSE
            NULL
        END
      ) AS "banned",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              SELECT
                posts.id
              FROM
                posts
              WHERE
                posts.channel_id = channels.id
              ORDER BY
                posts.created_at ASC
              LIMIT
                1
            )
          ELSE
            NULL
        END
      ) AS "firstPostId",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              SELECT
                posts.id
              FROM
                posts
              WHERE
                posts.channel_id = channels.id
              ORDER BY
                posts.created_at DESC
              LIMIT
                1
            )
          ELSE
            NULL
        END
      ) AS "lastPostId",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              SELECT
                posts.created_at
              FROM
                posts
              WHERE
                posts.channel_id = channels.id
              ORDER BY
                posts.created_at DESC
              LIMIT
                1
            )
          ELSE
            NULL
        END
      ) AS "lastPostAt",
      (
        CASE
          WHEN
            channels.type = 'channel'
          THEN
            (
              COALESCE((
                SELECT
                  JSON_AGG(p ORDER BY "createdAt" DESC)
                FROM
                (
                  SELECT
                    posts.id,
                    posts.channel_id AS "channelId",
                    posts.user_id AS "userId",
                    posts.content,
                    posts.created_at AS "createdAt",
                    (
                      SELECT
                        JSON_BUILD_OBJECT(
                          'id',
                          users.id,
                          'username',
                          users.username,
                          'avatar',
                          users.avatar
                        )
                      FROM
                        users
                      WHERE
                        users.id = posts.user_id
                    ) AS "author",
                    (
                      SELECT
                        COUNT(*)
                      FROM
                        post_likes
                      WHERE
                        post_likes.post_id = posts.id
                    ) AS "likeCount",
                    (
                      SELECT
                        COUNT(*)
                      FROM
                        comments
                      WHERE
                        comments.post_id = posts.id
                    ) AS "commentCount",
                    (
                      SELECT
                        comments.id
                      FROM
                        comments
                      WHERE
                        comments.post_id = posts.id
                      ORDER BY
                        comments.created_at ASC
                      LIMIT
                        1
                    ) AS "firstCommentId",
                    (
                      SELECT
                        comments.id
                      FROM
                        comments
                      WHERE
                        comments.post_id = posts.id
                      ORDER BY
                        comments.created_at DESC
                      LIMIT
                        1
                    ) AS "lastCommentId",
                    (
                      CASE
                        WHEN
                          EXISTS (
                            SELECT
                              1
                            FROM
                              post_likes
                            WHERE
                              post_likes.post_id = posts.id
                              AND post_likes.user_id = $2
                          )
                        THEN
                          TRUE
                        ELSE
                          FALSE
                      END
                    ) AS "liked",
                    COALESCE((
                      SELECT
                        JSON_AGG(c ORDER BY "createdAt" ASC)
                      FROM
                      (
                        SELECT
                          comments.id,
                          comments.post_id AS "postId",
                          comments.user_id AS "userId",
                          comments.content,
                          comments.created_at AS "createdAt",
                          (
                            SELECT
                              JSON_BUILD_OBJECT(
                                'id',
                                users.id,
                                'username',
                                users.username,
                                'avatar',
                                users.avatar
                              )
                            FROM
                              users
                            WHERE
                              users.id = comments.user_id
                          ) AS "author",
                          (
                            SELECT
                              COUNT(*)
                            FROM
                              comment_likes
                            WHERE
                              comment_likes.comment_id = comments.id
                          ) AS "likeCount",
                          (
                            CASE
                              WHEN
                                EXISTS (
                                  SELECT
                                    1
                                  FROM
                                    comment_likes
                                  WHERE
                                    comment_likes.comment_id = comments.id
                                    AND comment_likes.user_id = $2
                                )
                              THEN
                                TRUE
                              ELSE
                                FALSE
                            END
                          ) AS "liked"
                        FROM
                          comments
                        WHERE
                          comments.post_id = posts.id
                        ORDER BY
                          comments.created_at DESC
                        LIMIT
                          3
                      ) AS c
                    ), '[]') AS comments
                  FROM
                    posts
                  WHERE
                    posts.channel_id = channels.id
                  ORDER BY
                    posts.created_at DESC
                  LIMIT
                    7
                ) AS p
              ), '[]')
            )
          ELSE
            NULL
        END
      ) AS "posts"
    FROM
      channels
    WHERE
      channels.id = $1
      AND (
        CASE
          WHEN
            channels.type != 'channel'
          THEN
            EXISTS (
              SELECT
                1
              FROM
                members
              WHERE
                members.channel_id = $1
                AND members.user_id = $2
            )
          WHEN
            channels.type = 'channel'
          THEN
            NOT EXISTS (
              SELECT
                1
              FROM
                members
              WHERE
                members.channel_id = $1
                AND members.user_id = $2
                AND members.banned = TRUE
            )
          ELSE
            FALSE
        END
      )
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
