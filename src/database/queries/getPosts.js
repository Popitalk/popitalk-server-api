const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId, beforePostId }, db = database) => {
  try {
    const query = knex
      .select("*")
      .from(q => {
        q.select("id")
          .select("channel_id AS channelId")
          .select("user_id AS userId")
          .select("content")
          .select("created_at AS createdAt")
          .select(
            knex.raw(/* SQL */ `
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
          ) AS "author"
          `)
          )
          .select(
            knex.raw(/* SQL */ `
            (
              SELECT
                COUNT(*)
              FROM
                post_likes
              WHERE
                post_likes.post_id = posts.id
            ) AS "likesCount"
          `)
          )
          .select(
            knex.raw(/* SQL */ `
            (
              SELECT
                COUNT(*)
              FROM
                comments
              WHERE
                comments.post_id = posts.id
            ) AS "commentsCount"
          `)
          )
          .select(
            knex.raw(/* SQL */ `
            COALESCE((
              SELECT
                JSON_AGG(c ORDER BY "createdAt" DESC)
              FROM
              (
                SELECT
                  comments.id,
                  comments.post_id AS "channelId",
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
                  ) AS "likesCount"
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
          `)
          )
          .from("posts")
          .where("channel_id", channelId)
          .andWhere(
            knex.raw(
              /* SQL */ `
            EXISTS (
              SELECT
                1
              FROM
                members
              WHERE
                members.channel_id = ?
                AND members.user_id = ?
            )`,
              [channelId, userId]
            )
          )
          .orderBy("created_at", "desc")
          .limit(7)
          .as("p");
        if (beforePostId) {
          q.andWhere(
            knex.raw(
              /* SQL */ `
            created_at < (
              SELECT
                p.created_at
              FROM
                posts AS p
              WHERE
                p.id = ?
            )`,
              [beforePostId]
            )
          );
        }
      })
      .orderBy("createdAt", "DESC");

    const response = (await db.query(query.toString())).rows;

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
