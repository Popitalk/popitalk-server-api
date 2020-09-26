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
            WHEN
              chans.status = 'Paused'
            THEN (
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
            WHEN
              chans.status = 'Playing'
            THEN (
              SELECT
                vids.video_info
              FROM (
                SELECT
                  videos.length,
                  videos.video_info,
                  SUM(videos.length) OVER (ORDER BY channel_videos.queue_position) AS cumlen
                FROM
                  videos
                JOIN
                  channel_videos
                ON
                  channel_videos.video_id = videos.id
                WHERE
                  channel_videos.channel_id = chans.id
                  AND chans.queue_start_position <= channel_videos.queue_position
                ORDER BY
                  channel_videos.queue_position
              ) AS vids
              WHERE
                vids.cumlen - chans.video_start_time > EXTRACT(epoch from (NOW() - chans.clock_start_time))
              LIMIT
                1
            )
          END
      )
    )
  ), '{}'::JSON) AS "channels"
FROM
  chans