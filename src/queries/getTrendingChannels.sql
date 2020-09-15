
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
  chans.id AS "channelId",
  chans.name AS "channelName",
  chans.icon AS "channelIcon",
  chans.status AS "playbackStatus",
  videos.video_info AS "videoInfo"
FROM
  chans
LEFT JOIN
  channel_videos
ON
  channel_videos.channel_id = chans.id
  AND channel_videos.queue_position = chans.queue_start_position
LEFT JOIN
  videos
ON
  channel_videos.video_id = videos.id
