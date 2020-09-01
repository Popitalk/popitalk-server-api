SELECT
  users.id,
  users.username,
  users.first_name AS "firstName",
  users.last_name AS "lastName",
  users.avatar
FROM
  users
WHERE
  (users.username % $1 OR users.username LIKE '%' || $1 || '%')
  AND users.deleted_at IS NULL
ORDER BY
  users.username <-> $1 ASC
LIMIT
  9
