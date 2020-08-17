SELECT count(1)
FROM follow_requests
WHERE channel_id = $1
	AND created_at BETWEEN now() AND (now() - '50 hours'::INTERVAL);
