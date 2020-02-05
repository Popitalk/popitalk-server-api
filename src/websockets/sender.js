const _ = require("lodash");
const {
  websocketsOfUsers,
  usersOfChannels,
  channelsOfUsers
} = require("../config/state");
const {
  userEvents,
  channelEvents,
  channelsEvents,
  WS_ADD_CHANNEL,
  WS_JOIN_CHANNEL,
  WS_LEAVE_CHANNEL
} = require("../config/constants");
const { subscriber } = require("../config/pubSub");

const sender = async (messageType, messagePayload) => {
  if (userEvents.includes(messageType)) {
    // eslint-disable-next-line prefer-const
    let { userId, channelId } = messagePayload;

    const ws = websocketsOfUsers.get(userId);

    if (messageType === WS_ADD_CHANNEL || messageType === WS_JOIN_CHANNEL) {
      channelsOfUsers.get(userId).set(channelId, messagePayload.type);

      if (!usersOfChannels.has(channelId)) {
        usersOfChannels.set(channelId, new Set());
        usersOfChannels.get(channelId).add(userId);
        subscriber.subscribe(channelId);
      }
    } else if (messageType === WS_LEAVE_CHANNEL) {
      channelsOfUsers.get(userId).delete(channelId);

      usersOfChannels.get(channelId).delete(userId);

      if (usersOfChannels.get(channelId).size === 0) {
        usersOfChannels.delete(channelId);
        subscriber.unsubscribe(channelId);
      }
    }
    ws.send(
      JSON.stringify({
        type: messageType,
        payload: messagePayload
      })
    );
  } else if (channelEvents.includes(messageType)) {
    const { channelId } = messagePayload;

    if (usersOfChannels.has(channelId)) {
      const userIds = usersOfChannels.get(channelId).values();

      for await (const uid of userIds) {
        const ws = websocketsOfUsers.get(uid);

        // if(ws.readyState === 1)
        ws.send(
          JSON.stringify({
            type: messageType,
            payload: messagePayload
          })
        );
      }
    }
  } else if (channelsEvents.includes(messageType)) {
    const { userId } = messagePayload;

    if (channelsOfUsers.has(userId)) {
      const channelIds = channelsOfUsers.get(userId).keys();

      for await (const cid of channelIds) {
        if (usersOfChannels.has(cid)) {
          const userIds = usersOfChannels.get(cid).values();

          for await (const uid of userIds) {
            const ws = websocketsOfUsers.get(uid);

            ws.send(
              JSON.stringify({
                type: messageType,
                payload: messagePayload
              })
            );
          }
        }
      }
    }
  }
};

module.exports = sender;
