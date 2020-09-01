const knex = require("../config/knex");

module.exports = ({ channelId, userId, afterMessageId, beforeMessageId }) => {
  const query = knex
    .select("*")
    .from(q => {
      q.select("id")
        .select("user_id AS userId")
        .select("channel_id AS channelId")
        .select("content")
        .select("upload")
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
              users.id = messages.user_id
          ) AS "author"
          `)
        )
        .from("messages")
        .where("channel_id", channelId)
        .limit(50)
        .as("m");

      if (userId) {
        q.andWhere(
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
                AND NOT members.banned
            )`,
            [channelId, userId]
          )
        );
      }

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
        ).orderBy("created_at", "asc");
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
        ).orderBy("created_at", "desc");
      }
      if (!afterMessageId && !beforeMessageId) {
        q.orderBy("created_at", "desc");
      }
    })
    .orderBy("createdAt", "asc");

  return query.toString();
};
