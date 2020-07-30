const queries = require("../queries");

class VideoRepository {
  constructor(db) {
    this.db = db;
  }

  async getHasPermission({ userId, channelId }) {
    return this.db.one(queries.getHasPermission, {
      channelId,
      userId
    });
  }

  async getChannelQueue({ channelId }) {
    return this.db.any(queries.getChannelQueue, { channelId });
  }

  async addVideo({ videoId, length, videoInfo }) {
    return this.db.one(queries.addVideo, [videoId, length, videoInfo]);
  }

  async addChannelVideo({ channelId, videoId }) {
    return this.db.one(queries.addChannelVideo, [channelId, videoId]);
  }

  async deleteChannelVideo({ channelVideoId }) {
    return this.db.one(queries.deleteChannelVideo, { channelVideoId });
  }
}

module.exports = VideoRepository;