WITH channel_post_ids AS (
	SELECT id
	FROM posts
	WHERE channel_id = $1
)
SELECT post_id
FROM post_likes, channel_post_ids
WHERE post_likes.post_id = channel_post_ids.id
	AND post_likes.created_at BETWEEN now() AND (now() - '50 hours'::interval);
