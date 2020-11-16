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
  channels AS chans
WHERE
  chans.public
  AND chans.id IN (
    SELECT
      *
    FROM
      unnest($1::UUID[])
  )
  AND EXISTS (
    SELECT
      1
    FROM
      members
    WHERE
      members.channel_id = chans.id
      AND NOT (members.user_id = $2 AND members.banned)
)
