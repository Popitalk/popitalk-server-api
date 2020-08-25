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
    return this.db.one(queries.getChannelAndMemberInfo, [channelId, userId]);
  }

  async getChannelLastMessageInfo({ channelId }) {
    return this.db.oneOrNone(queries.getChannelLastMessageInfo, [channelId]);
  }

  async getChannelLastPostInfo({ channelId }) {
    return this.db.one(queries.getChannelLastPostInfo, [channelId]);
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

  async getPostLikesInLast50Hrs({ channelId }) {
    return this.db.manyOrNone(queries.getPostLikesInLast50Hrs, [channelId]);
  }

  async getCommentIdsInLast50Hrs({ channelId }) {
    return this.db.manyOrNone(queries.getCommentIdsInLast50Hrs, [channelId]);
  }

  async getCountFollowRequestsInLast50Hrs({ channelId }) {
    return this.db.manyOrNone(queries.getCountFollowRequestsInLast50Hrs, [
      channelId
    ]);
  }

  async getNewChannels() {
    return this.db.manyOrNone(queries.getNewChannels);
  }

  async searchChannels({ searchTerm, pageNo }) {
    const offset = (pageNo - 1) * 9;
    return this.db.manyOrNone(queries.searchChannels, [searchTerm, offset]);
  }
}

module.exports = ChannelRepository;
