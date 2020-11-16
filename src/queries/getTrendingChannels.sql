WITH chans AS (
  SELECT
    channels.*
  FROM
    members
  JOIN
    channels
  ON
    channels.id = members.channel_id
  WHERE
    channels.type = 'channel'
    AND channels.public
    AND members.created_at > (CURRENT_DATE - INTERVAL '10 days')
  GROUP BY
    channels.id
  ORDER BY
    COUNT(*) DESC, channels.created_at DESC
  LIMIT
    30
)
SELECT
  COALESCE(JSON_OBJECT_AGG(
    chans.id,
    JSON_BUILD_OBJECT(
      'name',
      chans.name,
      'icon',
      chans.icon,
      'playbackStatus',
      chans.status,
      'videoInfo',
      (
        SELECT
          CASE
            WHEN
              chans.status = 'Ended'
            THEN
              NULL
            ELSE (
              SELECT
                videos.video_info
              FROM
                videos
              JOIN
                channel_videos
              ON
                channel_videos.channel_id = chans.id
                AND channel_videos.queue_position = chans.queue_start_position
                AND videos.id = channel_videos.video_id
            )
          END
      )
    )
  ), '{}'::JSON) AS "channels"
FROM
  chans
WHERE
  EXISTS (
    SELECT
      1
    FROM
      members
    WHERE
      members.channel_id = chans.id
      AND NOT (members.user_id = $1 AND members.banned)
  )
