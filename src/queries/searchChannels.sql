SELECT
  channels.id,
  channels.name,
  channels.description,
  channels.status,
  channels.queue_start_position AS "queueStartPosition",
  channels.icon,
  channels.owner_id AS "ownerId"
FROM
  channels
WHERE
  (channels.name % $1 OR channels.name LIKE '%' || $1 || '%')
  AND channels.type = 'channel'
ORDER BY
  channels.name <-> $1 ASC
LIMIT
  9
OFFSET
  $2
