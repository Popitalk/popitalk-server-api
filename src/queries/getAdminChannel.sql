WITH chan AS (
  SELECT
    channels.id,
    channels.type,
    channels.name,
    channels.description,
    channels.icon,
    channels.public,
    channels.owner_id,
    channels.created_at,
    fm.id AS "firstMessageId",
    lm.id AS "lastMessageId",
    lm.created_at AS "lastMessageAt",
    fp.id AS "firstPostId",
    lp.id AS "lastPostId",
    lp.created_at AS "lastPostAt",
    mems.member_ids AS "members",
    mems.admin_ids AS "admins",
    mems.banned_ids AS "banned"
  FROM
    channels
  LEFT JOIN LATERAL (
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
  ) fm ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      messages.id,
      messages.created_at
    FROM
      messages
    WHERE
      messages.channel_id = channels.id
    ORDER BY
      messages.created_at DESC
    LIMIT
      1
  ) lm ON TRUE
  LEFT JOIN LATERAL (
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
  ) fp ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      posts.id,
      posts.created_at
    FROM
      posts
    WHERE
      posts.channel_id = channels.id
    ORDER BY
      posts.created_at DESC
    LIMIT
      1
  ) lp ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(ARRAY_AGG(members.user_id) FILTER (WHERE NOT banned), ARRAY[]::UUID[]) AS member_ids,
      COALESCE(ARRAY_AGG(members.user_id) FILTER (WHERE admin), ARRAY[]::UUID[]) AS admin_ids,
      COALESCE(ARRAY_AGG(members.user_id) FILTER (WHERE banned), ARRAY[]::UUID[]) AS banned_ids
    FROM
      members
    WHERE
      members.channel_id = channels.id
  ) mems ON TRUE
  WHERE
    channels.id = $1
), chan_obj AS (
  SELECT
    ROW_TO_JSON(chan) AS channel
  FROM
    chan
), usrs AS (
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
    ) AS users
  FROM
    users, chan
  WHERE
    users.id = ANY (chan.members || chan.banned)
), msgs AS (
  SELECT
    COALESCE(
      ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'id',
          m.id,
          'userId',
          m.user_id,
          'channelId',
          m.channel_id,
          'content',
          m.content,
          'upload',
          m.upload,
          'createdAt',
          m.created_at,
          'author',
          m.author
        )
      ), ARRAY[]::JSON[]) AS "messages"
  FROM (
    SELECT
      *
    FROM (
      SELECT
        messages.id,
        messages.user_id,
        messages.channel_id,
        messages.content,
        messages.upload,
        messages.created_at,
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
        ) AS author
      FROM
        messages, chan
      WHERE
        messages.channel_id = chan.id
      ORDER BY
        messages.created_at DESC
      LIMIT
        50
    ) AS o
    ORDER BY
      o.created_at ASC
  ) AS m
  -- psts_obj like chan_obj
), psts AS (
  SELECT
    posts.id AS pid,
    posts.created_at AS pcreated_at,
    *
  FROM
    posts, chan
  WHERE
    posts.channel_id = chan.id
  ORDER BY
    posts.created_at DESC
  LIMIT
    7
), psts_arr AS (
  SELECT
    COALESCE(ARRAY_AGG(psts.pid), ARRAY[]::UUID[]) AS ids
  FROM
    psts
), psts_obj AS (
  SELECT
    COALESCE(
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'id',
        psts.pid,
        'channelId',
        psts.channel_id,
        'userId',
        psts.user_id,
        'content',
        psts.content,
        'upload',
        psts.upload,
        'createdAt',
        psts.pcreated_at,
        'author',
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
            users.id = psts.user_id
        ),
        'liked',
        (
          CASE
            WHEN
              EXISTS (
                SELECT
                  1
                FROM
                  post_likes
                WHERE
                  post_likes.post_id = psts.pid
                  AND post_likes.user_id = $2
              )
            THEN
              TRUE
            ELSE
              FALSE
          END
        ),
        'likeCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            post_likes
          WHERE
            post_likes.post_id = psts.pid
        ),
        'commentCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
        ),
        'selfCommentCount',
        (
          SELECT
            COUNT(*)::SMALLINT
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
            AND comments.user_id = $2
        ),
        'firstCommentId',
        (
          SELECT
            comments.id
          FROM
            comments
          WHERE
            comments.post_id = psts.pid
          ORDER BY
            comments.created_at ASC
          LIMIT
            1
        ),
        'lastCommentId',
        (
        SELECT
          comments.id
        FROM
          comments
        WHERE
          comments.post_id = psts.pid
        ORDER BY
          comments.created_at DESC
        LIMIT
          1
        )
      )
    ), ARRAY[]::JSON[]) AS "posts"
  FROM
    psts
), cmnts AS (
  SELECT
    JSON_AGG(c ORDER BY "createdAt" DESC) AS comments
  FROM (
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
      ) AS author,
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
      ) AS liked,
      (
        SELECT
          COUNT(*)::SMALLINT
        FROM
          comment_likes
        WHERE
          comment_likes.comment_id = comments.id
      ) AS "likeCount"
    FROM
      comments, psts_arr
    WHERE
      comments.post_id = ANY (psts_arr.ids)
    ORDER BY
      comments.created_at DESC
    LIMIT
      3
  ) AS c
)
SELECT
  chan_obj.channel AS channel,
  usrs.users AS users,
  msgs.messages AS messages,
  psts_obj.posts AS posts,
  COALESCE(cmnts.comments, '[]'::JSON) AS comments
FROM
  chan_obj, usrs, msgs, psts_obj, cmnts
