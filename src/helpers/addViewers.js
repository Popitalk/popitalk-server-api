const redis = require("../config/redis");

module.exports = async (db, obj) => {
  const newObj = obj;

  const channelIds = Object.keys(newObj.channels);
  const allViewersIds = new Set();

  for await (const cid of channelIds) {
    const viewerIds = await redis.smembers(`viewers:${cid}`);
    newObj.channels[cid].viewers = viewerIds;
    viewerIds.forEach(allViewersIds.add, allViewersIds);
  }

  const { users } = await db.UserRepository.getUsers({
    userIds: [...allViewersIds]
  });

  newObj.users = {
    ...newObj.users,
    ...users
  };

  return newObj;
};
