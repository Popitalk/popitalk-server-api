const db = require("../config/database");

module.exports.addMessage = async ({ userId, channelId, content }) => {
  return db.MessageRepository.addMessage({ userId, channelId, content });
};

module.exports.getMessages = async ({
  userId,
  channelId,
  afterMessageId,
  beforeMessageId
}) => {
  return db.MessageRepository.getMessages({
    userId,
    channelId,
    afterMessageId,
    beforeMessageId
  });
};

module.exports.deleteMessage = async ({ userId, messageId }) => {
  return db.t(async t => {
    const deletedMessage = await t.MessageRepository.deleteMessage({
      userId,
      messageId
    });
    const channelLastMessageInfo = await t.ChannelRepository.getChannelLastMessageInfo(
      { channelId: deletedMessage.channelId }
    );
    return { ...deletedMessage, ...channelLastMessageInfo };
  });
};
