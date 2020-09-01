const redis = require("../config/redis.js");
const ChannelService = require("../services/ChannelService.js");

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

module.exports = async ({ userId }) => {
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
