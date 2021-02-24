const queries = require("../queries");

class ChannelRepository {
  constructor(db) {
    this.db = db;
  }

  async addSelfRoom() {
    return this.db.one(queries.addRoom, ["self"]);
  }

  async addFriendRoom() {
    return this.db.one(queries.addRoom, ["friend"]);
  }

  async addStrangerRoom() {
    return this.db.one(queries.addRoom, ["stranger"]);
  }

  async updateStrangerRoom(channelId) {
    return this.db.none(queries.updateStrangerChannel, [channelId]);
  }

  async addGroupRoom() {
    return this.db.one(queries.addRoom, ["group"]);
  }

  async addChannel({
    name,
    description,
    icon,
    public: publicChannel,
    ownerId
  }) {
    return this.db.one(queries.addChannel, [
      "channel",
      name,
      description,
      icon,
      publicChannel,
      ownerId
    ]);
  }

  async getRoomChannel({ channelId }) {
    return this.db.one(queries.getRoomChannel, [channelId]);
  }

  async getAdminChannel({ channelId, userId }) {
    return this.db.one(queries.getAdminChannel, [channelId, userId]);
  }

  async getPublicChannel({ channelId, userId }) {
    return this.db.one(queries.getPublicChannel, [channelId, userId]);
  }

  async getPrivateChannel({ channelId }) {
    return this.db.one(queries.getPrivateChannel, [channelId]);
  }

  async getChannelAndMemberInfo({ channelId, userId }) {
    return this.db.oneOrNone(queries.getChannelAndMemberInfo, [
      channelId,
      userId
    ]);
  }

  async updateChannel({
    channelId,
    userId,
    name,
    description,
    public: publicChannel,
    icon,
    removeIcon
  }) {
    return this.db.one(queries.updateChannel, {
      channelId,
      userId,
      name,
      description,
      publicChannel,
      icon,
      removeIcon
    });
  }

  async updatePlayerStatus(newPlayerStatus) {
    return this.db.one(queries.updatePlayerStatus, newPlayerStatus);
  }

  async deleteChannel({ channelId, userId }) {
    return this.db.one(
      queries.deleteChannel,
      [channelId, userId],
      res => res.channelId
    );
  }

  async deleteFriendRoom({ userId1, userId2 }) {
    return this.db.one(queries.deleteFriendRoom, [userId1, userId2]);
  }

  async getPlayerStatus({ channelId }) {
    return this.db.one(queries.getPlayerStatus, { channelId });
  }

  async searchChannels({ channelName, page, userId }) {
    return this.db.one(queries.searchChannels, [channelName, page, userId]);
  }

  async getAvatars({ channelId }) {
    return this.db.manyOrNone(queries.getAvatars, [channelId]);
  }

  async getDiscoverChannels({ page }) {
    return this.db.one(queries.getDiscoverChannels, [page]);
  }

  async getTrendingChannels({ userId, page }) {
    return this.db.one(queries.getTrendingChannels, [userId, page]);
  }

  async getFollowingChannels({ userId, page }) {
    return this.db.one(queries.getFollowingChannels, [userId, page]);
  }

  async getRecommendedChannels({ categories }) {
    return this.db.one(queries.getRecommendedChannels, { categories });
  }
}

module.exports = ChannelRepository;
