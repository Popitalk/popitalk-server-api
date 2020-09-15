SELECT
  COALESCE(JSON_OBJECT_AGG(
    channels.id,
    videos.video_info
  ), '{}'::JSON) AS "videoInfo"
FROM
  channels
JOIN
  channel_videos
ON
  channel_videos.channel_id = channels.id
  AND channel_videos.queue_position = channels.queue_start_position
JOIN
  videos
ON
  videos.id = channel_videos.video_id
WHERE
  channels.id IN (
    SELECT
      *
    FROM
      unnest($1::UUID[])
  )
