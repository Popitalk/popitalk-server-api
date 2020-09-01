WITH chan AS (
  SELECT
    channels.id,
    channels.type,
    channels.name,
    channels.public,
    channels.status,
    channels.queue_start_position AS "queueStartPosition",
    channels.video_start_time AS "videoStartTime",
    channels.clock_start_time AS "clockStartTime",
    channels.created_at AS "createdAt",
    fm.id AS "firstMessageId",
    lm.id AS "lastMessageId",
    lm.created_at AS "lastMessageAt",
    members.ids AS "members"
  FROM
    channels
  LEFT JOIN LATERAL (
      SELECT
        messages.id AS id
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
        messages.id AS id,
        messages.created_at AS created_at
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
        COALESCE(ARRAY_AGG(members.user_id), ARRAY[]::UUID[]) AS ids
      FROM
        members
      WHERE
        members.channel_id = channels.id
        AND NOT members.banned
    ) members ON TRUE
  LEFT JOIN LATERAL (
      SELECT
        COALESCE(ARRAY_AGG(chat_notifications.user_id), ARRAY[]::UUID[]) AS ids
      FROM
        chat_notifications
      WHERE
        chat_notifications.channel_id = channels.id
    ) seen ON TRUE
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
    users.id = ANY (chan.members)
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
)
SELECT
  chan_obj.channel AS channel,
  usrs.users AS users,
  msgs.messages AS messages
FROM
  chan_obj, usrs, msgs
