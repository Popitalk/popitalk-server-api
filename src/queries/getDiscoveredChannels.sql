SELECT
  channels.id AS "channelId",
  channels.name AS "channelName",
  channels.icon AS "channelIcon",
  channels.status AS "playbackStatus"
FROM
  channels
WHERE
  channels.type = 'channel'
  AND channels.public
ORDER BY
  random() FETCH FIRST 3 ROWS ONLY
