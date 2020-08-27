const db = require("../config/database");
const { getTrending, getDiscover } = require("./ranker");

module.exports.getLoginData = async ({ userId }) => {
  return db.task(async t => {
    const loginData = await t.SessionRepository.getLoginData({ userId });
    try {
      const { trendingChannels, trendingChannelsUsers } = await getTrending({
        userId
      });
      const { discoverChannels, discoverChannelsUsers } = await getDiscover({
        userId
      });

      let trendingKeys = Object.keys(trendingChannels);
      trendingKeys = trendingKeys.slice(0, 6);
      const trendingChannels6 = {};
      trendingKeys.forEach(trendingKey => {
        trendingChannels6[trendingKey] = trendingChannels[trendingKey];
      });

      const discoverKeys = Object.keys(discoverChannels);
      const discoverChannels6 = {};
      discoverKeys.forEach(discoverKey => {
        if (
          !trendingKeys.includes(discoverKey) &&
          Object.keys(discoverChannels6).length < 6
        ) {
          discoverChannels6[discoverKey] = discoverChannels[discoverKey];
        }
      });

      // combine stuff
      loginData.channels = {
        ...loginData.channels,
        ...discoverChannels6,
        ...trendingChannels6
      };
      loginData.users = {
        ...loginData.users,
        ...discoverChannelsUsers,
        ...trendingChannelsUsers
      };
    } catch {
    } finally {
      return loginData;
    }
  });
};
