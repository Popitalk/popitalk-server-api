WITH chan AS (
  SELECT
    channels.id,
    channels.type,
    channels.name,
    channels.description,
    channels.icon,
    channels.public,
    channels.status,
    channels.queue_start_position AS "queueStartPosition",
    channels.video_start_time AS "videoStartTime",
    channels.clock_start_time AS "clockStartTime",
    channels.owner_id,
    channels.created_at,
    mems.admin_ids AS admins,
    mems.admin_ids AS "memberCount"
  FROM
    channels
  LEFT JOIN LATERAL (
    SELECT
      COUNT(members.user_id) FILTER (WHERE NOT banned) AS member_count,
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
    users.id = ANY (chan.admins)
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
