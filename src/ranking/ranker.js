const redis = require("../config/redis.js");
const ChannelService = require("../services/ChannelService.js");

module.exports.sentChannel = async ({ channelId, userId }) => {
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

module.exports.getTrending = async ({ userId }) => {
  const top6ChannelIds = await redis.lrange("trending", 0, 5);
  if (top6ChannelIds.length < 3) {
    return {
      trendingChannels: [],
      trendingChannelsUsers: []
    };
  }
  const top6ChannelsPromises = top6ChannelIds.map(async channelId => {
    const channelInfoStr = await redis.get(channelId);
    let channelInfo;

    if (channelInfoStr === null) {
      try {
        channelInfo = await ChannelService.getChannel({ channelId, userId });
        redis.set(channelId, JSON.stringify(channelInfo), "EX", 30);
      } catch {
        return {};
      }
    } else {
      channelInfo = JSON.parse(channelInfoStr);
    }
    return {
      [channelId]: {
        ...channelInfo
      }
    };
  });
  const top6ChannelsArray = await Promise.all(top6ChannelsPromises);
  await redis.incr("promise_com");
  await redis.set("check", JSON.stringify({ top6ChannelsArray }));
  let top6Channels;
  let top6ChannelsUsers;
  top6ChannelsArray.forEach(channel => {
    try {
      top6Channels = {
        ...top6Channels,
        [channel[Object.keys(channel)[0]].channel.id]: {
          ...channel[Object.keys(channel)[0]].channel,
          queue: channel[Object.keys(channel)[0]].queue,
          speciality: "trending"
        }
      };
      top6ChannelsUsers = {
        ...top6ChannelsUsers,
        ...channel[Object.keys(channel)[0]].users
      };
    } catch {}
  });
  return {
    trendingChannels: top6Channels,
    trendingChannelsUsers: top6ChannelsUsers
  };
};

module.exports.setTrending = async () => {
  const listOfActiveChannels = await redis.keys("channel:*");

  let listOfChannels = [];
  listOfChannels = listOfActiveChannels.map(channel => channel.slice(8));
  if (listOfChannels.length < 6) {
    await redis.del("trending");
    return;
  }

  // sorting out top 36
  const promises = await listOfChannels.map(async channelKey => {
    const requestCount = await redis.get(`channel:${channelKey}`);
    return {
      id: channelKey,
      reqCount: parseInt(requestCount, 10) || 0
    };
  });
  let top36Channels = await Promise.all(promises);
  top36Channels = top36Channels.sort((a, b) => b.reqCount - a.reqCount);
  top36Channels = top36Channels.slice(0, 36);

  const top36ChannelScoresPromises = top36Channels.map(async item => {
    const channelId = item.id;
    const averagePostLikes = await ChannelService.getAvgPostLikesInLast50Hrs({
      channelId
    });
    const averageCommentCount = await ChannelService.getAvgCommentInLast50Hrs({
      channelId
    });
    const averageFollowRequests = await ChannelService.getCountFollowRequestsInLast50Hrs(
      { channelId }
    );
    return {
      ...item,
      score:
        averagePostLikes ** 1 +
        averageCommentCount ** 1.5 +
        averageFollowRequests ** 2
    };
  });
  let top36ChannelScores = await Promise.all(top36ChannelScoresPromises);
  top36ChannelScores = top36ChannelScores.sort((a, b) => b.score - a.score);

  const top36ChannelIds = top36ChannelScores.map(channel => channel.id);

  await redis.set("settrending", 1);
  const _ = await redis.del("trending");
  redis.rpush("trending", top36ChannelIds);
};

const collectRandom = async (count, keys) => {
  if (keys.length === 0) {
    const channelKeys = await redis.keys("channel:*");
    if (channelKeys.length === 0) {
      return keys;
    }
  }
  let randomKey = "";
  let i = 10;
  while (randomKey.slice(0, 7) !== "channel") {
    i--;
    randomKey = await redis.randomkey();
    if (i < 0) {
      return keys;
    }
  }
  if (count === 1) {
    return [...keys, randomKey.slice(8)];
  }
  return collectRandom(count - 1, [...keys, randomKey.slice(8)]);
};

module.exports.getDiscover = async ({ userId }) => {
  let channelIds = await collectRandom(36, []);
  channelIds = Array.from(new Set(channelIds));
  if (channelIds.length < 3) {
    return {
      discoverChannels: [],
      discoverChannelsUsers: []
    };
  }
  const channelsPromises = channelIds.map(async channelId => {
    const channelInfoStr = await redis.get(channelId);
    let channelInfo;

    if (channelInfoStr === null) {
      try {
        channelInfo = await ChannelService.getChannel({ channelId, userId });
      } catch {
        return {};
      }
      redis.set(channelId, JSON.stringify(channelInfo), "EX", 30);
    } else {
      channelInfo = JSON.parse(channelInfoStr);
    }
    return {
      [channelId]: {
        ...channelInfo
      }
    };
  });
  const ChannelsArray = await Promise.all(channelsPromises);
  let discoverChannels;
  let discoverChannelsUsers;
  ChannelsArray.forEach(channel => {
    try {
      discoverChannels = {
        ...discoverChannels,
        [channel[Object.keys(channel)[0]].channel.id]: {
          ...channel[Object.keys(channel)[0]].channel,
          queue: channel[Object.keys(channel)[0]].queue,
          speciality: "discover"
        }
      };
      discoverChannelsUsers = {
        ...discoverChannelsUsers,
        ...channel[Object.keys(channel)[0]].users
      };
    } catch {}
  });
  return {
    discoverChannels,
    discoverChannelsUsers
  };
};
