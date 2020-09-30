const db = require("../config/database");

module.exports.addMessage = async ({ userId, channelId, content, upload }) => {
  return db.MessageRepository.addMessage({
    userId,
    channelId,
    content,
    upload
  });
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
  return db.task(async t => {
    const deletedMessage = await t.MessageRepository.deleteMessage({
      userId,
      messageId
    });

    const channelLastMessageInfo = (await t.ChannelRepository.getChannelLastMessageInfo(
      { channelId: deletedMessage.channelId }
    )) || { firstMessageId: null, lastMessageId: null, lastMessageAt: null };

    return { ...deletedMessage, ...channelLastMessageInfo };
  });
};
