WITH chans AS (
  SELECT
    channels.*
  FROM
    members
  JOIN
    channels
  ON
    channels.id = members.channel_id
    AND members.user_id = $1
  WHERE
    channels.type = 'channel'
    AND channels.public
    AND NOT channels.owner_id = $1
    AND NOT members.banned
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
