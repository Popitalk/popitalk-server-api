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
    AND NOT members.banned
    AND members.created_at > (CURRENT_DATE - INTERVAL '10 days')
  GROUP BY
    channels.id
  ORDER BY
    COUNT(*) DESC, channels.created_at DESC
  LIMIT
    5
)
SELECT
  COALESCE(JSON_OBJECT_AGG(
    chans.id,
    JSON_BUILD_OBJECT(
      'channelName',
      chans.name,
      'channelIcon',
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
