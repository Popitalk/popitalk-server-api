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
    mems.admin_ids AS "admins"
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
      COALESCE(ARRAY_AGG(members.user_id) FILTER (WHERE admin), ARRAY[]::UUID[]) AS admin_ids
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
    LIMIT
      50
    ORDER BY
      messages.created_at DESC
  ) AS m
  ORDER BY
    m.created_at ASC
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
    users
  WHERE
    users.id = ANY (chan.members)
), psts AS (
  SELECT
    posts.id,
    posts.channel_id,
    posts.user_id,
    posts.content,
    posts.upload,
    posts.created_at,
    fc.id AS "firstCommentId",
    lc.id AS "lastCommentId",
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
    ) AS author,
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
    ) AS liked,
    (
      SELECT
        COUNT(*)::SMALLINT
      FROM
        post_likes
      WHERE
        post_likes.post_id = posts.id
    ) AS "likeCount",
    (
      SELECT
        COUNT(*)::SMALLINT
      FROM
        comments
      WHERE
        comments.post_id = posts.id
    ) AS "commentCount",
    (
      SELECT
        COUNT(*)::SMALLINT
      FROM
        comments
      WHERE
        comments.post_id = posts.id
        AND comments.user_id = $2
    ) AS "selfCommentCount"
  FROM
    posts, chan
  LEFT JOIN LATERAL (
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
  ) fc ON TRUE
  LEFT JOIN LATERAL (
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
  ) lc ON TRUE
  WHERE
    posts.channel_id = chan.id
  ORDER BY
    posts.created_at DESC
  LIMIT
    7
), cmnts AS (
  SELECT
    COALESCE(ARRAY_AGG(c ORDER BY "createdAt" DESC), ARRAY[]::JSON[]) AS comments
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
      comments
    WHERE
      comments.post_id = ANY (psts.id)
    ORDER BY
      comments.created_at DESC
    LIMIT
      3
  ) AS c
)
SELECT
  JSON_BUILD_OBJECT(
    'channel',
    chan_obj.channel,
    'users',
    usrs.users,
    'messages',
    msgs.messages,
    'posts',
    psts.posts,
    'comments',
    cmnts.comments,
  )
FROM
  chan_obj, usrs, msgs, psts, cmnts
