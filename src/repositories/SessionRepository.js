/* eslint-disable class-methods-use-this */
const queries = require("../queries");
const ranker = require("../ranking/ranker");

class SessionRepository {
  constructor(db) {
    this.db = db;
  }

  async getLoginData({ userId }) {
    // get stuff
    const loginData = await this.db.one(queries.getLoginData, [userId]);
    const {
      trendingChannels,
      trendingChannelsUsers
    } = await ranker.getTrending({ userId });
    const {
      discoverChannels,
      discoverChannelsUsers
    } = await ranker.getDiscover({ userId });

    // combine stuff
    loginData.channels = {
      ...loginData.channels,
      ...trendingChannels,
      ...discoverChannels
    };
    loginData.users = {
      ...loginData.users,
      ...trendingChannelsUsers,
      ...discoverChannelsUsers
    };

    return loginData;
  }
}

module.exports = SessionRepository;
