const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userId, afterMessageId, beforeMessageId },
  db = database
) => {
  try {
    const query = knex
      .select("*")
      .from(q => {
        q.select("id")
          .select("user_id AS userId")
          .select("channel_id AS channelId")
          .select("content")
          .select("upload")
          .select(
            knex.raw(/* SQL */ `
          (
            SELECT
              JSON_BUILD_OBJECT(
                'id',
                users.id,
                'firstName',
                users.first_name,
                'lastName',
                users.last_name,
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
          `)
          )
          .select("created_at AS createdAt")
          .from("messages")
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
          .limit(50)
          .as("m");
        if (afterMessageId) {
          q.andWhere(
            knex.raw(
              /* SQL */ `
            created_at > (
              SELECT
                m.created_at
              FROM
                messages AS m
              WHERE
                m.id = ?
            )`,
              [afterMessageId]
            )
          );
        }
        if (beforeMessageId) {
          q.andWhere(
            knex.raw(
              /* SQL */ `
            created_at < (
              SELECT
                m.created_at
              FROM
                messages AS m
              WHERE
                m.id = ?
            )`,
              [beforeMessageId]
            )
          );
        }
      })
      .orderBy("createdAt", "asc");

    const response = (await db.query(query.toString())).rows;

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
