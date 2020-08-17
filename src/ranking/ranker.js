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
  const top36ChannelIds = await redis.lrange("trending", 0, 36);
  const top36ChannelsPromises = top36ChannelIds.map(async channelId => {
    const channelInfoStr = await redis.get(channelId);
    let channelInfo;

    if (channelInfoStr === null) {
      channelInfo = await ChannelService.getChannel({ channelId, userId });
      redis.set(channelId, JSON.stringify(channelInfo), "EX", 864000);
    } else {
      channelInfo = JSON.parse(channelInfoStr);
    }
    return {
      [channelId]: {
        ...channelInfo
      }
    };
  });
  const top36ChannelsArray = await Promise.all(top36ChannelsPromises);
  let top36Channels;
  let top36ChannelsUsers;
  top36ChannelsArray.forEach(channel => {
    top36Channels = {
      ...top36Channels,
      [channel[Object.keys(channel)[0]].channel.id]: {
        ...channel[Object.keys(channel)[0]].channel,
        speciality: "trending"
      }
    };
    top36ChannelsUsers = {
      ...top36ChannelsUsers,
      ...channel[Object.keys(channel)[0]].users
    };
  });

  return {
    trendingChannels: top36Channels,
    trendingChannelsUsers: top36ChannelsUsers
  };
};

module.exports.setTrending = async () => {
  const listOfActiveChannels = await redis.keys("channel:*");

  // this is only run if less than 36 channels were
  // organically opened in the last 50 hrs
  let listOfChannels = [];
  listOfChannels = listOfActiveChannels.map(channel => channel.slice(8));
  if (listOfChannels.length < 36) {
    const channelIds = await ChannelService.getNewChannels();
    for (let i = 0; i < channelIds.length; i += 2) {
      listOfChannels.push(channelIds[i].id);
    }
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

  const _ = await redis.del("trending");
  redis.rpush("trending", top36ChannelIds);
};

const collectRandom = async (count, keys) => {
  let randomKey = "";
  while (randomKey.slice(0, 7) !== "channel") {
    randomKey = await redis.randomkey();
  }
  if (count === 1) {
    return [...keys, randomKey.slice(8)];
  }
  return collectRandom(count - 1, [...keys, randomKey.slice(8)]);
};

module.exports.getDiscover = async ({ userId }) => {
  const channelIds = await collectRandom(36, []);
  const channelsPromises = channelIds.map(async channelId => {
    const channelInfoStr = await redis.get(channelId);
    let channelInfo;

    if (channelInfoStr === null) {
      channelInfo = await ChannelService.getChannel({ channelId, userId });
      redis.set(channelId, JSON.stringify(channelInfo), "EX", 864000);
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
    discoverChannels = {
      ...discoverChannels,
      [channel[Object.keys(channel)[0]].channel.id]: {
        ...channel[Object.keys(channel)[0]].channel,
        speciality: "discover"
      }
    };
    discoverChannelsUsers = {
      ...discoverChannelsUsers,
      ...channel[Object.keys(channel)[0]].users
    };
  });
  return {
    discoverChannels,
    discoverChannelsUsers
  };
};
