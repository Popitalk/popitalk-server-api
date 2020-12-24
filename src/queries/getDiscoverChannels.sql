SELECT
  COALESCE(JSON_AGG(chans.ids), '[]'::JSON) AS "channelIds"
FROM (
  SELECT
    channels.id AS ids
  FROM
    channels
    INNER JOIN channel_videos ON channel_videos.channel_id = channels.id
  WHERE
    channels.type = 'channel'
    AND channels.public
    AND channels.icon IS NOT NULL
  GROUP BY
    channels.id
  ORDER BY
    channels.created_at DESC 
  LIMIT 
    30  
  OFFSET
    ($1 - 1) * 30  
) AS chans
