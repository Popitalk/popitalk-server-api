const { isEmpty } = require("lodash");
const knex = require("../config/knex");

module.exports = ({ channelId, userId, beforePostId }) => {
  const query = knex
    .select("*")
    .from(q => {
      q.select("id")
        .select("channel_id AS channelId")
        .select("user_id AS userId")
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
              users.id = posts.user_id
          ) AS "author"
          `)
        )
        .select(
          knex.raw(/* SQL */ `
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
            ) AS "firstCommentId"
          `)
        )
        .select(
          knex.raw(/* SQL */ `
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
            ) AS "lastCommentId"
          `)
        )
        .select(
          knex.raw(
            /* SQL */ `
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
                      AND post_likes.user_id = ?
                  )
                THEN
                  TRUE
                ELSE
                  FALSE
              END
            ) AS "liked"
          `,
            [userId]
          )
        )
        .select(
          knex.raw(/* SQL */ `
            (
              SELECT
                COUNT(*)::SMALLINT
              FROM
                post_likes
              WHERE
                post_likes.post_id = posts.id
            ) AS "likeCount"
          `)
        )
        .select(
          knex.raw(/* SQL */ `
            (
              SELECT
                COUNT(*)::SMALLINT
              FROM
                comments
              WHERE
                comments.post_id = posts.id
            ) AS "commentCount"
          `)
        )
        .select(
          knex.raw(
            /* SQL */ `
            (
              SELECT
                COUNT(*)::SMALLINT
              FROM
                comments
              WHERE
                comments.post_id = posts.id
                AND comments.user_id = ?
            ) AS "selfCommentCount"
          `,
            [userId]
          )
        )
        .select(
          knex.raw(
            /* SQL */ `
            COALESCE((
              SELECT
                JSON_AGG(c ORDER BY "createdAt" DESC)
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
                    CASE
                      WHEN
                        EXISTS (
                          SELECT
                            1
                          FROM
                            comment_likes
                          WHERE
                            comment_likes.comment_id = comments.id
                            AND comment_likes.user_id = ?
                        )
                      THEN
                        TRUE
                      ELSE
                        FALSE
                    END
                  ) AS "liked",
                  (
                    SELECT
                      COUNT(*)::SMALLINT
                    FROM
                      comment_likes
                    WHERE
                      comment_likes.comment_id = comments.id
                  ) AS "likeCount"
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
          `,
            [userId]
          )
        )
        .from("posts")
        .where("channel_id", channelId)
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

  const response = query.toString();

  if (response.length === 0) return null;

  let posts = response;
  let comments = {};

  if (posts) {
    posts.forEach(post => {
      if (post.comments.length !== 0) {
        comments = {
          ...comments,
          [post.id]: post.comments
        };
      }
      // eslint-disable-next-line no-param-reassign
      delete post.comments;
    });

    if (isEmpty(comments)) {
      comments = {};
    }
  }
  if (isEmpty(posts)) {
    posts = {};
  }

  return { posts, comments };
};
