/* eslint-disable class-methods-use-this */
const queries = require("../queries");

class MessageRepository {
  constructor(db) {
    this.db = db;
  }

  async addMessage({ channelId, userId, content, upload }) {
    return this.db.one(queries.addMessage, [
      channelId,
      userId,
      content,
      upload
    ]);
  }

  async getMessages({ channelId, userId, afterMessageId, beforeMessageId }) {
    return this.db.any(queries.getMessages, {
      channelId,
      userId,
      afterMessageId,
      beforeMessageId
    });
  }

  async deleteMessage({ messageId, userId }) {
    return this.db.one(queries.deleteMessage, [messageId, userId]);
  }
  // Chat notificaitons
  async addChatNotification({ userId, channelId }) {
    return this.db.one(queries.addChatNotification, [channelId, userId]);
  }
  async deleteChatNotification({ userId, channelId }) {
    return this.db.one(queries.deleteChatNotification, [channelId, userId]);
  }
}

module.exports = MessageRepository;
