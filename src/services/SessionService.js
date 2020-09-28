const bcrypt = require("bcryptjs");
const db = require("../config/database");
const redis = require("../config/redis");
// const CircDepRes = require("../ranking/cir_dep_resolver");
const { discoverChannels } = require("../services/ChannelService");
const { trendingChannels } = require("../services/ChannelService");

module.exports.login = async ({ usernameOrEmail, password }) => {
  return db.task(async t => {
    const user = await t.UserRepository.getUser({
      usernameOrEmail,
      withPassword: true
    });

    if (!user || !(await bcrypt.compare(password, user.password))) return false;

    let loginData = await t.SessionRepository.getLoginData({
      userId: user.id
    });
    const channelIds = Object.keys(loginData.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      loginData = {
        ...loginData,
        channels: {
          ...loginData.channels,
          [cid]: {
            ...loginData.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    const discoverChannelsData = await discoverChannels({ userId: user.id });
    const trendingChannelsData = await trendingChannels({ userId: user.id });

    loginData.channels = {
      channels: loginData.channels,
      discoverChannels: discoverChannelsData,
      trendingChannels: trendingChannelsData
    };

    loginData = {
      ...loginData,
      users: {
        ...loginData.users,
        ...users
      }
    };

    return loginData;
  });
};

module.exports.getLoginData = async ({ userId }) => {
  return db.task(async t => {
    let loginData = await t.SessionRepository.getLoginData({ userId });
    const channelIds = Object.keys(loginData.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      loginData = {
        ...loginData,
        channels: {
          ...loginData.channels,
          [cid]: {
            ...loginData.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    const discoverChannelsData = await discoverChannels(userId);
    const trendingChannelsData = await trendingChannels(userId);

    loginData.channels = {
      channels: loginData.channels,
      discoverChannels: discoverChannelsData,
      trendingChannels: trendingChannelsData
    };

    loginData = {
      ...loginData,
      users: {
        ...loginData.users,
        ...users
      }
    };

    return loginData;
  });
};
