SELECT
  COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'id',
      channel_videos.id,
      'channelId',
      channel_videos.channel_id,
      'videoId',
      channel_videos.video_id,
      'length',
      videos.length,
      'videoInfo',
      videos.video_info,
      'title',
      q.video_info->>'title',
      'publishedAt',
      q.video_info->>'publishedAt',
      'thumbnail',
      q.video_info->>'thumbnail',
      'url',
      q.video_info->>'url'
    )
  ), '[]'::JSON) AS "queue"
FROM
  channel_videos
JOIN
  videos
ON
  videos.id = channel_videos.video_id
WHERE
  channel_videos.channel_id = $1
-- ORDER BY
--   channel_videos.queue_position ASC
