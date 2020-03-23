WITH chan AS (
  SELECT
    channels.id,
    channels.type,
    channels.name,
    channels.public,
    channels.created_at,
    fm.id AS "first_message_id",
    lm.id AS "last_message_id",
    lm.created_at AS "last_message_at",
    members.ids AS "members",
    seen.ids AS "seen_messages"
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
        COALESCE(ARRAY_AGG(seen_messages.user_id), ARRAY[]::UUID[]) AS ids
      FROM
        seen_messages
      WHERE
        seen_messages.channel_id = channels.id
    ) seen ON TRUE
  WHERE
    channels.id = $1
), chan_obj AS (
  SELECT
    JSON_BUILD_OBJECT(
      'id',
      chan.id,
      'type',
      chan.type,
      'name',
      chan.name,
      'public',
      chan.public,
      'createdAt',
      chan.created_at,
      'firstMessageId',
      chan.first_message_id,
      'lastMessageId',
      chan.last_message_id,
      'lastMessageAt',
      chan.last_message_at,
      'members',
      chan.members,
      'seenMessages',
      chan.seen_messages
    ) AS channel
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
)
SELECT
  JSON_BUILD_OBJECT(
    'channel',
    chan_obj.channel,
    'users',
    usrs.users,
    'messages',
    msgs.messages
  )
FROM
  chan_obj, usrs, msgs
