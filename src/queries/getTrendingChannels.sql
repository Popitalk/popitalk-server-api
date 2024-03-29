WITH chans AS (
  SELECT
    channels.*,
    MAX(members.created_at) AS last_joined
  FROM
    members
  JOIN
    channels
  ON
    channels.id = members.channel_id
  JOIN 
    channel_videos 
  ON 
    channel_videos.channel_id = channels.id
  WHERE
    channels.type = 'channel'
    AND channels.public
    AND channels.icon IS NOT NULL
  GROUP BY
    channels.id
  ORDER BY
    COUNT(*) DESC, last_joined DESC
  LIMIT
    24
  OFFSET
    ($2 - 1) * 24      
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
                  x.*,
                  SUM(x.length + 3) OVER () AS quelen,
                  SUM(x.cumlen) FILTER (WHERE queue_position = chans.queue_start_position) OVER () AS startlen
                FROM (
                  SELECT
                    videos.length,
                    videos.video_info,
                    COALESCE(SUM(videos.length + 3) OVER (ORDER BY channel_videos.queue_position ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS cumlen,
                    channel_videos.queue_position
                  FROM
                    videos
                  JOIN
                    channel_videos
                  ON
                    channel_videos.video_id = videos.id
                  WHERE
                    channel_videos.channel_id = chans.id
                  ORDER BY
                    channel_videos.queue_position
                ) AS x
                ORDER BY
                  x.queue_position DESC
              ) AS vids
              WHERE
                vids.cumlen <
                (((EXTRACT(epoch FROM (NOW() - chans.clock_start_time))::BIGINT) + vids.startlen + (chans.video_start_time)::BIGINT) % vids.quelen)
              LIMIT
                1
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
  