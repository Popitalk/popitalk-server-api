const redis = require("../config/redis.js");

module.exports = async ({ channelId, userId }) => {
  const channelKey = `channel:${channelId}`;
  const userKey = `user:${userId}`;

  const result = await redis.incr(userKey);
  redis.expire(userKey, 10);

  // checking if spammer
  if (result === 1) {
    redis
      .incr(channelKey)
      .then(() => {
        return redis.expire(channelKey, 180000);
      })
      .catch(() => {});
  }
};
